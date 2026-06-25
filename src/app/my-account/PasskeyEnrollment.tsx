"use client"

import { getAccessToken } from "@auth0/nextjs-auth0"
import { useState } from "react"

interface EnrollmentState {
  status: "default" | "enrolling" | "complete" | "error"
  enrollmentInfo?: any
  error?: string
}

export default function PasskeyEnrollment({ config }: { config: any }) {
  const [enrollmentState, setEnrollmentState] = useState<EnrollmentState>({ status: "default" })

  const initiatePasskeyEnrollment = async () => {
    const accessToken = await getAccessToken()
    try {
      const response = await fetch(`https://${config.auth0_domain}/me/v1/authentication-methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type: "passkey",
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        console.log("Error:", result)
        setEnrollmentState({ ...enrollmentState, status: "error", error: result.error || "Passkey enrollment failed" })
        return
      }

      setEnrollmentState({ ...enrollmentState, status: "enrolling", enrollmentInfo: result })
    } catch (error) {
      console.error("Error:", error)
      setEnrollmentState({ ...enrollmentState, status: "error", error: "Unknown error" })
    }
  }

  const confirmPasskeyEnrollment = async () => {
    const { challenge, rp, user, pubKeyCredParams } = enrollmentState.enrollmentInfo.authn_params_public_key
    const { auth_session } = enrollmentState.enrollmentInfo

    const accessToken = await getAccessToken()
    let publicKeyCredential = (await navigator.credentials.create({
      publicKey: {
        challenge: base64UrlToArrayBuffer(challenge),
        rp,
        user: {
          ...user,
          id: base64UrlToArrayBuffer(user.id),
        },
        pubKeyCredParams,
      },
    })) as PublicKeyCredential | null

    if (!publicKeyCredential) {
      return setEnrollmentState({ ...enrollmentState, status: "error", error: "Failed to create credential" })
    }

    const publicKeyCredentialJSON = publicKeyCredential.toJSON() as RegistrationResponseJSON
    console.log("PublicKeyCredentialJSON:", publicKeyCredentialJSON)

    try {
      const response = await fetch(`https://${config.auth0_domain}/me/v1/authentication-methods/passkey|new/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          auth_session,
          authn_response: {
            authenticatorAttachment: publicKeyCredentialJSON.authenticatorAttachment,
            clientExtensionResults: publicKeyCredentialJSON.clientExtensionResults,
            id: publicKeyCredentialJSON.id,
            rawId: publicKeyCredentialJSON.rawId,
            type: publicKeyCredentialJSON.type,
            response: {
              attestationObject: publicKeyCredentialJSON.response.attestationObject,
              clientDataJSON: publicKeyCredentialJSON.response.clientDataJSON,
              transports: publicKeyCredentialJSON.response.transports,
            },
          },
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        console.log("Error:", result)
        setEnrollmentState({ ...enrollmentState, status: "error", error: result.error || "Passkey enrollment failed" })
        return
      }
    } catch (error) {
      console.error("Error:", error)
      return setEnrollmentState({ ...enrollmentState, status: "error", error: "Unknown error" })
    }

    setEnrollmentState({ ...enrollmentState, status: "complete" })
    return
  }

  return (
    <div>
      <details open>
        <summary className="cursor-pointer text-xl font-bold mb-4">
          <h3 className="text-gray-800 inline m-0 font-bold">Passkey Enrollment</h3>
        </summary>

        {enrollmentState.status === "default" && (
          <div className="mb-8">
            <p>Enroll a new passkey for your account.</p>
            <button
              className="border-0 rounded-sm cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-primary text-white hover:bg-blue-700"
              onClick={initiatePasskeyEnrollment}
            >
              Enroll Passkey
            </button>
          </div>
        )}

        {enrollmentState.status === "enrolling" && (
          <div className="mb-8">
            <p>Passkey enrollment initiated.</p>
            <div className="bg-gray-50 p-5 rounded-sm mt-5">
              <h4>Enrollment Info:</h4>
              <div className="bg-gray-200 p-4 rounded-sm my-3 break-all font-mono text-xs">
                <pre>{JSON.stringify(enrollmentState.enrollmentInfo, null, 2)}</pre>
              </div>
            </div>
            <div className="mt-5">
              <button
                className="border-0 rounded-sm cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-primary text-white hover:bg-blue-700"
                onClick={confirmPasskeyEnrollment}
              >
                Confirm Passkey Enrollment
              </button>
            </div>
          </div>
        )}

        {enrollmentState.status === "complete" && (
          <div className="mt-5">
            <div className="bg-green-100 border border-green-300 text-green-900 p-5 rounded-sm">
              <h4>✅ Passkey Enrollment Successful!</h4>
              <p>Your passkey has been successfully enrolled.</p>
            </div>
          </div>
        )}

        {enrollmentState.status === "error" && (
          <p className="text-danger bg-red-100 p-4 rounded-sm my-4">{enrollmentState.error}</p>
        )}
      </details>
    </div>
  )
}

function base64UrlToArrayBuffer(base64UrlString: string): ArrayBuffer {
  let base64String = base64UrlString.replace(/-/g, "+").replace(/_/g, "/")
  const padLength = (4 - (base64String.length % 4)) % 4
  base64String = base64String + "=".repeat(padLength)

  const binaryString = atob(base64String)

  const buffer = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    buffer[i] = binaryString.charCodeAt(i)
  }
  return buffer.buffer
}
