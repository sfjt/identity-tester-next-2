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

    const publicKeyCredentialJSON = publicKeyCredential.toJSON()
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
              attestationObject: (publicKeyCredentialJSON.response as any).attestationObject,
              clientDataJSON: publicKeyCredentialJSON.response.clientDataJSON,
              transports: (publicKeyCredentialJSON.response as any).transports,
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

  if (enrollmentState.status === "default") {
    return (
      <button
        className="border-0 rounded-sm cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-primary text-white hover:bg-blue-700"
        onClick={initiatePasskeyEnrollment}
      >
        Enroll Passkey
      </button>
    )
  }

  if (enrollmentState.status === "enrolling") {
    return (
      <div>
        <p>Passkey enrollment initiated.</p>
        <pre className="bg-gray-100 p-3 rounded-sm mt-3 overflow-x-auto">
          {JSON.stringify(enrollmentState.enrollmentInfo, null, 2)}
        </pre>
        <button
          className="border-0 rounded-sm cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-primary text-white hover:bg-blue-700"
          onClick={confirmPasskeyEnrollment}
        >
          Confirm Passkey Enrollment
        </button>
      </div>
    )
  }

  if (enrollmentState.status === "complete") {
    return <p>Passkey enrollment complete!</p>
  }

  if (enrollmentState.status === "error") {
    return <p>{enrollmentState.error}</p>
  }
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
