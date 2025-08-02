"use client"

import { useEffect, useReducer } from "react"
import Image from "next/image"
import QRCode from "qrcode"
import { getAccessToken } from "@auth0/nextjs-auth0"
import { mutate } from "swr"
import fetchConfig from "@/lib/fetchConfig"
import styles from "./mfa.module.css"

interface EnrollmentData {
  authenticator_type: string
  secret: string
  barcode_uri: string
  recovery_codes: string[]
}

interface TokenData {
  id_token: string
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}

interface OTPState {
  isEnrolling: boolean
  enrollmentData: EnrollmentData | null
  qrCodeDataUrl: string
  error: string | null
  otpCode: string
  isConfirming: boolean
  confirmationSuccess: boolean
  tokenData: TokenData | null
}

type OTPAction =
  | { type: "START_ENROLLMENT" }
  | { type: "ENROLLMENT_SUCCESS"; payload: EnrollmentData }
  | { type: "ENROLLMENT_ERROR"; payload: string }
  | { type: "SET_QR_CODE"; payload: string }
  | { type: "SET_OTP_CODE"; payload: string }
  | { type: "START_CONFIRMATION" }
  | { type: "CONFIRMATION_SUCCESS"; payload: TokenData }
  | { type: "CONFIRMATION_ERROR"; payload: string }
  | { type: "RESET" }

const initialState: OTPState = {
  isEnrolling: false,
  enrollmentData: null,
  qrCodeDataUrl: "",
  error: null,
  otpCode: "",
  isConfirming: false,
  confirmationSuccess: false,
  tokenData: null,
}

function otpReducer(state: OTPState, action: OTPAction): OTPState {
  switch (action.type) {
    case "START_ENROLLMENT":
      return {
        ...state,
        isEnrolling: true,
        error: null,
      }
    case "ENROLLMENT_SUCCESS":
      return {
        ...state,
        isEnrolling: false,
        enrollmentData: action.payload,
        error: null,
      }
    case "ENROLLMENT_ERROR":
      return {
        ...state,
        isEnrolling: false,
        error: action.payload,
      }
    case "SET_QR_CODE":
      return {
        ...state,
        qrCodeDataUrl: action.payload,
      }
    case "SET_OTP_CODE":
      return {
        ...state,
        otpCode: action.payload,
      }
    case "START_CONFIRMATION":
      return {
        ...state,
        isConfirming: true,
        error: null,
      }
    case "CONFIRMATION_SUCCESS":
      return {
        ...state,
        isConfirming: false,
        confirmationSuccess: true,
        tokenData: action.payload,
        error: null,
      }
    case "CONFIRMATION_ERROR":
      return {
        ...state,
        isConfirming: false,
        error: action.payload,
      }
    case "RESET":
      return initialState
    default:
      return state
  }
}

export default function OTPEnrollment() {
  const [state, dispatch] = useReducer(otpReducer, initialState)

  const handleStartEnrollment = async () => {
    dispatch({ type: "START_ENROLLMENT" })

    try {
      const config = await fetchConfig("/api/config")
      const url = `https://${config.auth0_domain}/mfa/associate`

      const token = await getAccessToken()

      const mfaResponse = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authenticator_types: ["otp"],
        }),
      })

      if (!mfaResponse.ok) {
        throw new Error(`MFA API error: ${mfaResponse.status}`)
      }

      const data = await mfaResponse.json()
      dispatch({ type: "ENROLLMENT_SUCCESS", payload: data })
    } catch (error) {
      console.error("MFA enrollment error:", error)
      dispatch({
        type: "ENROLLMENT_ERROR",
        payload: "Failed to start OTP enrollment. Please check your MFA token permissions.",
      })
    }
  }

  useEffect(() => {
    if (state.enrollmentData?.barcode_uri) {
      QRCode.toDataURL(state.enrollmentData.barcode_uri, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => {
          dispatch({ type: "SET_QR_CODE", payload: url })
        })
        .catch(() => {
          dispatch({ type: "ENROLLMENT_ERROR", payload: "Failed to generate QR code" })
        })
    }
  }, [state.enrollmentData])

  const handleConfirmEnrollment = async () => {
    if (!state.otpCode || state.otpCode.length !== 6) {
      dispatch({ type: "CONFIRMATION_ERROR", payload: "Please enter a valid 6-digit OTP code" })
      return
    }

    dispatch({ type: "START_CONFIRMATION" })

    try {
      const mfaToken = await getAccessToken()

      const response = await fetch("/api/mfa/otp/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: state.otpCode,
          mfaToken: mfaToken,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Confirmation failed")
      }

      dispatch({ type: "CONFIRMATION_SUCCESS", payload: result.tokenData })

      // Refresh the authenticators list
      mutate("/mfa")
    } catch (error) {
      console.error("Confirmation error:", error)
      dispatch({
        type: "CONFIRMATION_ERROR",
        payload: `Confirmation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  return (
    <div>
      <details>
        <summary className="expandable-summary">
          <h3>OTP Enrollment</h3>
        </summary>

        {!state.enrollmentData ? (
          <div className="section">
            <p>Enroll a new OTP (One-Time Password) authenticator for MFA.</p>
            <button className="btn btn-primary" onClick={handleStartEnrollment} disabled={state.isEnrolling}>
              {state.isEnrolling ? "Starting Enrollment..." : "Start OTP Enrollment"}
            </button>
            {state.error && <p className="error">{state.error}</p>}
          </div>
        ) : (
          <div className="section">
            <h4>Scan QR Code</h4>
            <p>Use your authenticator app to scan this QR code:</p>

            <div className="user-info">
              <div className="token-display">
                {state.qrCodeDataUrl ? (
                  <Image
                    src={state.qrCodeDataUrl}
                    alt="QR Code for OTP setup"
                    width={200}
                    height={200}
                    className={styles["qr-code-image"]}
                  />
                ) : (
                  <p>Generating QR code...</p>
                )}
              </div>

              <h4>Manual Entry:</h4>
              <div className="token-display">
                <strong>Secret:</strong> {state.enrollmentData.secret}
              </div>

              <h4>Barcode URI:</h4>
              <div className="token-display">
                <pre>{state.enrollmentData.barcode_uri}</pre>
              </div>

              {state.enrollmentData.recovery_codes && state.enrollmentData.recovery_codes.length > 0 && (
                <>
                  <h4>Recovery Codes:</h4>
                  <div className="token-display">
                    <pre>{JSON.stringify(state.enrollmentData.recovery_codes, null, 2)}</pre>
                  </div>
                </>
              )}
            </div>

            {!state.confirmationSuccess ? (
              <div className={styles["form-group"]}>
                <label htmlFor="otp-code" className={styles["form-label"]}>
                  Enter verification code from your app:
                </label>
                <input
                  id="otp-code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={state.otpCode}
                  onChange={(e) => dispatch({ type: "SET_OTP_CODE", payload: e.target.value.replace(/\D/g, "") })}
                  className={styles["otp-input"]}
                />
                <div className={styles["button-group"]}>
                  <button
                    className="btn btn-primary"
                    onClick={handleConfirmEnrollment}
                    disabled={state.isConfirming || state.otpCode.length !== 6}
                  >
                    {state.isConfirming ? "Confirming..." : "Confirm Enrollment"}
                  </button>
                  <button className="btn btn-secondary" onClick={() => dispatch({ type: "RESET" })}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles["form-group"]}>
                <div className={`user-info ${styles["success-message"]}`}>
                  <h4>✅ Enrollment Successful!</h4>
                  <p>Your OTP authenticator has been successfully enrolled for MFA.</p>

                  {state.tokenData && (
                    <>
                      <h4>Token Response:</h4>
                      <div className="token-display">
                        <pre>{JSON.stringify(state.tokenData, null, 2)}</pre>
                      </div>
                    </>
                  )}

                  <button className="btn btn-primary" onClick={() => dispatch({ type: "RESET" })}>
                    Enroll Another Authenticator
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </details>
    </div>
  )
}
