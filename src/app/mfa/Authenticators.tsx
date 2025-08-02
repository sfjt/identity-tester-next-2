"use client"

import useSWR from "swr"

import { getAccessToken } from "@auth0/nextjs-auth0"
import fetchConfig from "@/lib/fetchConfig"

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

export default function Authenticators() {
  const { data, error, isLoading } = useSWR("/mfa", getAuthenticators)
  if (error) {
    console.error(error)
    return <p className="error">Something went wrong.</p>
  }
  if (isLoading || !data) {
    return <p className="loading">Loading...</p>
  }

  return (
    <div>
      <h3>Authenticators</h3>
      <div className="user-info">
        <h4>HTTP Status:</h4>
        <div className="token-display">{data.status}</div>

        <h4>API Response:</h4>
        <div className="token-display">
          <pre>{JSON.stringify(data.json, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
