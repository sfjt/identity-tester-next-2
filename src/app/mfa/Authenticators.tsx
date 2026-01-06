"use client"

import { useState } from "react"
import useSWR from "swr"

import { getAccessToken } from "@auth0/nextjs-auth0"
import fetchConfig from "@/lib/fetch-config"

async function getAuthenticators() {
  const config = await fetchConfig("/api/config")
  const url = `https://${config.auth0_domain}/mfa/authenticators`
  const token = await getAccessToken()
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return {
    status: res.status,
    json: await res.json(),
  }
}

interface Authenticator {
  id: string
  authenticator_type: string
  active: boolean
  oob_channel?: string
  name?: string
  [key: string]: unknown
}

interface AuthenticatorItemProps {
  authenticator: Authenticator
  onDelete: (id: string) => Promise<void>
  isDeleting: boolean
}

function AuthenticatorItem({ authenticator, onDelete, isDeleting }: AuthenticatorItemProps) {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this authenticator?\n\nID: ${authenticator.id}`)) {
      onDelete(authenticator.id)
    }
  }

  return (
    <div className="bg-gray-50 p-5 rounded mt-5 mb-4">
      <dl>
        {Object.entries(authenticator).map(([key, value]) => (
          <div key={key} className="mb-1">
            <dt className="font-bold inline">{key}:</dt>
            <dd className="ml-2 inline">{typeof value === "boolean" ? (value ? "true" : "false") : String(value)}</dd>
          </div>
        ))}
      </dl>
      <div className="ml-0">
        <button
          className="border-0 rounded cursor-pointer transition-colors bg-danger text-white hover:bg-red-700 text-sm py-1.5 px-3 m-0"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  )
}

export default function Authenticators() {
  const { data, error, isLoading, mutate } = useSWR("/mfa/authenticators", getAuthenticators)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const handleDelete = async (authenticatorId: string) => {
    setDeletingIds((prev) => new Set(prev).add(authenticatorId))

    try {
      const config = await fetchConfig("/api/config")
      const url = `https://${config.auth0_domain}/mfa/authenticators/${authenticatorId}`
      const token = await getAccessToken()

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete authenticator: ${response.status}`)
      }

      mutate()
    } catch (error) {
      console.error("Delete error:", error)
      alert(`Failed to delete authenticator: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(authenticatorId)
        return newSet
      })
    }
  }

  if (error) {
    console.error(error)
    return <p className="text-danger bg-red-100 p-4 rounded my-4">Something went wrong.</p>
  }
  if (isLoading || !data) {
    return <p className="text-center text-gray-600 p-5">Loading...</p>
  }

  const authenticators = Array.isArray(data.json) ? data.json : []

  return (
    <div>
      <details open>
        <summary className="cursor-pointer text-xl font-bold mb-4">
          <h3 className="inline m-0 font-bold">Authenticators</h3>
        </summary>
        <div className="bg-gray-50 p-5 rounded mt-5">
          <h4>HTTP Status:</h4>
          <div className="bg-gray-200 p-4 rounded my-3 break-all font-mono text-xs">{data.status}</div>

          <h4 className="mb-3">Authenticators ({authenticators.length}):</h4>
          {authenticators.length > 0 ? (
            authenticators.map((authenticator: Authenticator, index: number) => (
              <div key={authenticator.id || index} className="mb-3">
                <h5 className="m-0 mb-2 text-base text-gray-600">Authenticator {index + 1}</h5>
                <AuthenticatorItem
                  authenticator={authenticator}
                  onDelete={handleDelete}
                  isDeleting={deletingIds.has(authenticator.id)}
                />
              </div>
            ))
          ) : (
            <p>No authenticators found.</p>
          )}

          <details className="mt-5">
            <summary className="cursor-pointer font-bold">Show Raw JSON Response</summary>
            <div className="bg-gray-200 p-4 rounded my-3 break-all font-mono text-xs">
              <pre>{JSON.stringify(data.json, null, 2)}</pre>
            </div>
          </details>
        </div>
      </details>
    </div>
  )
}
