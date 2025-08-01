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
    return <p>Something went wrong.</p>
  }
  if (isLoading || !data) {
    return <p>Loading...</p>
  }

  return (
    <section>
      <h3>Authenticators</h3>
      <p>
        <code>{data.status}</code>
      </p>
      <pre>
        <code>{JSON.stringify(data.json, null, 2)}</code>
      </pre>
    </section>
  )
}
