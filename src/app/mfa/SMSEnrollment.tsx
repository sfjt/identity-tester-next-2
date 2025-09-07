"use client"

import { useReducer } from "react"
import { getAccessToken } from "@auth0/nextjs-auth0"
import { mutate } from "swr"
import fetchConfig from "@/lib/fetch-config"
import styles from "./mfa.module.css"

interface EnrollmentData {
  authenticator_type: string
  oob_code: string
  oob_channel: string
  recovery_codes: string[]
}

interface TokenData {
  id_token: string
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}

interface SMSState {
  phoneNumber: string
  isEnrolling: boolean
  enrollmentData: EnrollmentData | null
  error: string | null
  otpCode: string
  isConfirming: boolean
  confirmationSuccess: boolean
  tokenData: TokenData | null
}

type SMSAction =
  | { type: "SET_PHONE_NUMBER"; payload: string }
  | { type: "START_ENROLLMENT" }
  | { type: "ENROLLMENT_SUCCESS"; payload: EnrollmentData }
  | { type: "ENROLLMENT_ERROR"; payload: string }
  | { type: "SET_OTP_CODE"; payload: string }
  | { type: "START_CONFIRMATION" }
  | { type: "CONFIRMATION_SUCCESS"; payload: TokenData }
  | { type: "CONFIRMATION_ERROR"; payload: string }
  | { type: "RESET" }

const initialState: SMSState = {
  phoneNumber: "",
  isEnrolling: false,
  enrollmentData: null,
  error: null,
  otpCode: "",
  isConfirming: false,
  confirmationSuccess: false,
  tokenData: null,
}

function smsReducer(state: SMSState, action: SMSAction): SMSState {
  switch (action.type) {
    case "SET_PHONE_NUMBER":
      return {
        ...state,
        phoneNumber: action.payload,
      }
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

function formatPhoneNumber(input: string): string {
  // Remove all non-digits
  const digits = input.replace(/\D/g, "")

  // Add + prefix if not present and we have digits
  if (digits.length > 0 && !input.startsWith("+")) {
    return "+" + digits
  }

  return input.startsWith("+") ? "+" + digits : digits
}

function validatePhoneNumber(phone: string): boolean {
  // Basic validation: should start with + and have at least 10 digits
  const phoneRegex = /^\+[1-9]\d{9,14}$/
  return phoneRegex.test(phone)
}

export default function SMSEnrollment() {
  const [state, dispatch] = useReducer(smsReducer, initialState)

  const handlePhoneNumberChange = (input: string) => {
    const formatted = formatPhoneNumber(input)
    dispatch({ type: "SET_PHONE_NUMBER", payload: formatted })
  }

  const handleStartEnrollment = async () => {
    if (!validatePhoneNumber(state.phoneNumber)) {
      dispatch({ type: "ENROLLMENT_ERROR", payload: "Please enter a valid phone number (e.g., +1234567890)" })
      return
    }

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
          authenticator_types: ["oob"],
          oob_channels: ["sms"],
          phone_number: state.phoneNumber,
        }),
      })

      if (!mfaResponse.ok) {
        const errorData = await mfaResponse.json()
        throw new Error(
          `MFA API error: ${mfaResponse.status} - ${errorData.error_description || errorData.error || "Unknown error"}`,
        )
      }

      const data = await mfaResponse.json()
      dispatch({ type: "ENROLLMENT_SUCCESS", payload: data })
    } catch (error) {
      console.error("SMS MFA enrollment error:", error)
      dispatch({
        type: "ENROLLMENT_ERROR",
        payload: `Failed to start SMS enrollment: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  const handleConfirmEnrollment = async () => {
    if (!state.otpCode || state.otpCode.length !== 6) {
      dispatch({ type: "CONFIRMATION_ERROR", payload: "Please enter a valid 6-digit SMS code" })
      return
    }

    dispatch({ type: "START_CONFIRMATION" })

    try {
      const mfaToken = await getAccessToken()

      const response = await fetch("/api/mfa/sms/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oobCode: state.enrollmentData!.oob_code,
          mfaToken: mfaToken,
          bindingCode: state.otpCode,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Confirmation failed")
      }

      dispatch({ type: "CONFIRMATION_SUCCESS", payload: result.tokenData })

      // Refresh the authenticators list
      mutate("/mfa/authenticators")
    } catch (error) {
      console.error("SMS confirmation error:", error)
      dispatch({
        type: "CONFIRMATION_ERROR",
        payload: `Confirmation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  const isPhoneValid = validatePhoneNumber(state.phoneNumber)

  return (
    <div>
      <details>
        <summary className="expandable-summary">
          <h3>SMS Enrollment</h3>
        </summary>

        {!state.enrollmentData ? (
          <div className="section">
            <p>Enroll a new SMS authenticator for MFA. You will receive a verification code via SMS.</p>

            <div className={styles["form-group"]}>
              <label htmlFor="phone-number" className={styles["form-label"]}>
                Phone Number (with country code):
              </label>
              <input
                id="phone-number"
                type="tel"
                placeholder="+1234567890"
                value={state.phoneNumber}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                className={`${styles["phone-input"]} ${isPhoneValid ? styles["phone-valid"] : state.phoneNumber ? styles["phone-invalid"] : ""}`}
              />
              <small className={styles["phone-help"]}>
                Enter your phone number with country code (e.g., +1 for US, +44 for UK)
              </small>
            </div>

            <div className={styles["button-group"]}>
              <button
                className="btn btn-primary"
                onClick={handleStartEnrollment}
                disabled={state.isEnrolling || !isPhoneValid}
              >
                {state.isEnrolling ? "Starting Enrollment..." : "Start SMS Enrollment"}
              </button>
            </div>

            {state.error && <p className="error">{state.error}</p>}
          </div>
        ) : (
          <div className="section">
            <h4>SMS Sent</h4>
            <p>
              A verification code has been sent to <strong>{state.phoneNumber}</strong>
            </p>

            <div className="user-info">
              <h4>Enrollment Details:</h4>
              <dl>
                <dt>Authenticator Type:</dt>
                <dd>{state.enrollmentData.authenticator_type}</dd>
                <dt>Channel:</dt>
                <dd>{state.enrollmentData.oob_channel}</dd>
                <dt>OOB Code:</dt>
                <dd className="token-display">{state.enrollmentData.oob_code}</dd>
              </dl>

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
                <label htmlFor="sms-code" className={styles["form-label"]}>
                  Enter the 6-digit code from SMS:
                </label>
                <input
                  id="sms-code"
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
                    {state.isConfirming ? "Confirming..." : "Confirm SMS Enrollment"}
                  </button>
                  <button className="btn btn-secondary" onClick={() => dispatch({ type: "RESET" })}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles["form-group"]}>
                <div className={`user-info ${styles["success-message"]}`}>
                  <h4>✅ SMS Enrollment Successful!</h4>
                  <p>Your SMS authenticator has been successfully enrolled for MFA.</p>
                  <p>
                    Phone number: <strong>{state.phoneNumber}</strong>
                  </p>

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

            {state.error && <p className="error">{state.error}</p>}
          </div>
        )}
      </details>
    </div>
  )
}
