"use client"

import { useState } from "react"
import useSWR from "swr"

import { getAccessToken } from "@auth0/nextjs-auth0"
import fetchConfig from "@/lib/fetchConfig"
import styles from "./mfa.module.css"

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
    <div className={`user-info ${styles["authenticator-item"]}`}>
      <dl>
        {Object.entries(authenticator).map(([key, value]) => (
          <div key={key} className={styles["property-row"]}>
            <dt>{key}:</dt>
            <dd>{typeof value === "boolean" ? (value ? "true" : "false") : String(value)}</dd>
          </div>
        ))}
      </dl>
      <div className={styles["button-container"]}>
        <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
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
    return <p className="error">Something went wrong.</p>
  }
  if (isLoading || !data) {
    return <p className="loading">Loading...</p>
  }

  const authenticators = Array.isArray(data.json) ? data.json : []

  return (
    <div>
      <details open>
        <summary className="expandable-summary">
          <h3>Authenticators</h3>
        </summary>
        <div className="user-info">
          <h4>HTTP Status:</h4>
          <div className="token-display">{data.status}</div>

          <h4 className={styles["section-header"]}>Authenticators ({authenticators.length}):</h4>
          {authenticators.length > 0 ? (
            authenticators.map((authenticator: Authenticator, index: number) => (
              <div key={authenticator.id || index} className={styles["authenticator-list-item"]}>
                <h5 className={styles["authenticator-header"]}>Authenticator {index + 1}</h5>
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

          <details className={styles["raw-json-details"]}>
            <summary className={styles["raw-json-summary"]}>Show Raw JSON Response</summary>
            <div className="token-display">
              <pre>{JSON.stringify(data.json, null, 2)}</pre>
            </div>
          </details>
        </div>
      </details>
    </div>
  )
}
