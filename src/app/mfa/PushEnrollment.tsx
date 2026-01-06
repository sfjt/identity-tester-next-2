"use client"

import { useEffect, useReducer } from "react"
import Image from "next/image"
import QRCode from "qrcode"
import { getAccessToken } from "@auth0/nextjs-auth0"
import { mutate } from "swr"
import fetchConfig from "@/lib/fetch-config"

interface EnrollmentData {
  authenticator_type: string
  barcode_uri: string
  oob_code: string
  recovery_codes: string[]
}

interface TokenData {
  id_token: string
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}

interface PushState {
  isEnrolling: boolean
  enrollmentData: EnrollmentData | null
  qrCodeDataUrl: string
  error: string | null
  isWaitingForConfirmation: boolean
  confirmationSuccess: boolean
  tokenData: TokenData | null
  pollingInterval: NodeJS.Timeout | null
}

type PushAction =
  | { type: "START_ENROLLMENT" }
  | { type: "ENROLLMENT_SUCCESS"; payload: EnrollmentData }
  | { type: "ENROLLMENT_ERROR"; payload: string }
  | { type: "SET_QR_CODE"; payload: string }
  | { type: "START_WAITING" }
  | { type: "CONFIRMATION_SUCCESS"; payload: TokenData }
  | { type: "CONFIRMATION_ERROR"; payload: string }
  | { type: "SET_POLLING_INTERVAL"; payload: NodeJS.Timeout }
  | { type: "CLEAR_POLLING_INTERVAL" }
  | { type: "RESET" }

const initialState: PushState = {
  isEnrolling: false,
  enrollmentData: null,
  qrCodeDataUrl: "",
  error: null,
  isWaitingForConfirmation: false,
  confirmationSuccess: false,
  tokenData: null,
  pollingInterval: null,
}

function pushReducer(state: PushState, action: PushAction): PushState {
  switch (action.type) {
    case "START_ENROLLMENT":
      return {
        ...state,
        isEnrolling: true,
        error: null,
        confirmationSuccess: false,
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
    case "START_WAITING":
      return {
        ...state,
        isWaitingForConfirmation: true,
        error: null,
      }
    case "CONFIRMATION_SUCCESS":
      return {
        ...state,
        isWaitingForConfirmation: false,
        confirmationSuccess: true,
        tokenData: action.payload,
        error: null,
      }
    case "CONFIRMATION_ERROR":
      return {
        ...state,
        isWaitingForConfirmation: false,
        error: action.payload,
      }
    case "SET_POLLING_INTERVAL":
      return {
        ...state,
        pollingInterval: action.payload,
      }
    case "CLEAR_POLLING_INTERVAL":
      if (state.pollingInterval) {
        clearInterval(state.pollingInterval)
      }
      return {
        ...state,
        pollingInterval: null,
      }
    case "RESET":
      if (state.pollingInterval) {
        clearInterval(state.pollingInterval)
      }
      return initialState
    default:
      return state
  }
}

export default function PushEnrollment() {
  const [state, dispatch] = useReducer(pushReducer, initialState)

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
          authenticator_types: ["oob"],
          oob_channels: ["auth0"],
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
        payload: "Failed to start Push enrollment. Please check your MFA token permissions.",
      })
    }
  }

  const handleStartWaiting = async () => {
    if (!state.enrollmentData?.oob_code) {
      dispatch({ type: "CONFIRMATION_ERROR", payload: "Missing OOB code for polling" })
      return
    }

    dispatch({ type: "START_WAITING" })

    const mfaToken = await getAccessToken()

    // Start polling for confirmation every 3 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/mfa/push/poll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oobCode: state.enrollmentData!.oob_code,
            mfaToken: mfaToken,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Polling failed")
        }

        if (result.status === "confirmed") {
          dispatch({ type: "CLEAR_POLLING_INTERVAL" })
          dispatch({ type: "CONFIRMATION_SUCCESS", payload: result.tokenData })

          // Refresh the authenticators list
          mutate("/mfa/authenticators")
        }
        // If status is "pending", continue polling
      } catch (error) {
        console.error("Polling error:", error)
        dispatch({ type: "CLEAR_POLLING_INTERVAL" })
        dispatch({
          type: "CONFIRMATION_ERROR",
          payload: `Polling failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      }
    }, 3000)

    dispatch({ type: "SET_POLLING_INTERVAL", payload: interval })

    // Auto-stop polling after 5 minutes (Guardian QR code expires)
    setTimeout(
      () => {
        dispatch({ type: "CLEAR_POLLING_INTERVAL" })
        if (!state.confirmationSuccess) {
          dispatch({ type: "CONFIRMATION_ERROR", payload: "Enrollment timeout. QR code expired after 5 minutes." })
        }
      },
      5 * 60 * 1000,
    )
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

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (state.pollingInterval) {
        clearInterval(state.pollingInterval)
      }
    }
  }, [state.pollingInterval])

  return (
    <div>
      <details>
        <summary className="cursor-pointer text-xl font-bold mb-4">
          <h3 className="text-gray-800 inline m-0 font-bold">Push Enrollment</h3>
        </summary>

        {!state.enrollmentData ? (
          <div className="mb-8">
            <p>Enroll a new Push authenticator using the Auth0 Guardian app for MFA.</p>
            <button
              className="border-0 rounded-sm cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-primary text-white hover:bg-blue-700"
              onClick={handleStartEnrollment}
              disabled={state.isEnrolling}
            >
              {state.isEnrolling ? "Starting Enrollment..." : "Start Push Enrollment"}
            </button>
            {state.error && <p className="text-danger bg-red-100 p-4 rounded-sm my-4">{state.error}</p>}
          </div>
        ) : (
          <div className="mb-8">
            <h4>Scan QR Code with Guardian App</h4>
            <p>Use the Auth0 Guardian mobile app to scan this QR code. You have 5 minutes to complete enrollment.</p>

            <div className="bg-gray-50 p-5 rounded-sm mt-5">
              <div className="bg-gray-200 p-4 rounded-sm my-3 break-all font-mono text-xs">
                {state.qrCodeDataUrl ? (
                  <Image
                    src={state.qrCodeDataUrl}
                    alt="QR Code for Push setup"
                    width={200}
                    height={200}
                    className="max-w-[200px] h-auto"
                  />
                ) : (
                  <p>Generating QR code...</p>
                )}
              </div>

              <h4>Barcode URI:</h4>
              <div className="bg-gray-200 p-4 rounded-sm my-3 break-all font-mono text-xs">
                <pre>{state.enrollmentData.barcode_uri}</pre>
              </div>

              {state.enrollmentData.recovery_codes && state.enrollmentData.recovery_codes.length > 0 && (
                <>
                  <h4>Recovery Codes:</h4>
                  <div className="bg-gray-200 p-4 rounded-sm my-3 break-all font-mono text-xs">
                    <pre>{JSON.stringify(state.enrollmentData.recovery_codes, null, 2)}</pre>
                  </div>
                </>
              )}
            </div>

            {!state.confirmationSuccess ? (
              <div className="mt-5">
                {!state.isWaitingForConfirmation ? (
                  <>
                    <p>
                      After scanning the QR code with Guardian app, click the button below to wait for confirmation:
                    </p>
                    <div className="[&>button+button]:ml-3">
                      <button
                        className="border-0 rounded-sm cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-primary text-white hover:bg-blue-700"
                        onClick={handleStartWaiting}
                      >
                        Wait for Guardian Confirmation
                      </button>
                      <button
                        className="border-0 rounded-sm cursor-pointer transition-colors bg-secondary text-white text-sm py-2 px-4 m-1 hover:bg-gray-700"
                        onClick={() => dispatch({ type: "RESET" })}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>⏳ Waiting for you to approve the enrollment in the Guardian app...</p>
                    <p>
                      <small>Polling Auth0 every 3 seconds for confirmation...</small>
                    </p>
                    <div className="[&>button+button]:ml-3">
                      <button
                        className="border-0 rounded-sm cursor-pointer transition-colors bg-secondary text-white text-sm py-2 px-4 m-1 hover:bg-gray-700"
                        onClick={() => {
                          dispatch({ type: "CLEAR_POLLING_INTERVAL" })
                          dispatch({ type: "RESET" })
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-5">
                <div className="bg-gray-50 p-5 rounded-sm mt-5 bg-green-100 border border-green-300 text-green-900">
                  <h4>✅ Enrollment Successful!</h4>
                  <p>Your Push authenticator has been successfully enrolled for MFA using Guardian app.</p>
                  <p>
                    <strong>Note:</strong> Push enrollment automatically includes OTP capability as a fallback.
                  </p>

                  {state.tokenData && (
                    <>
                      <h4>Token Response:</h4>
                      <div className="bg-gray-200 p-4 rounded-sm my-3 break-all font-mono text-xs">
                        <pre>{JSON.stringify(state.tokenData, null, 2)}</pre>
                      </div>
                    </>
                  )}

                  <button
                    className="border-0 rounded-sm cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-primary text-white hover:bg-blue-700"
                    onClick={() => dispatch({ type: "RESET" })}
                  >
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
