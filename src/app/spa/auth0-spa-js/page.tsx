"use client"

import { useState } from "react"
import { createAuth0Client, PopupTimeoutError } from "@auth0/auth0-spa-js"
import type { IdToken } from "@auth0/auth0-spa-js"
import useSWRImmutable from "swr/immutable"

import fetchConfig from "@/lib/fetchConfig"

async function createClient(uri: string) {
  const config = await fetchConfig(uri)
  const client = await createAuth0Client({
    domain: config.auth0_domain,
    clientId: config.spa_client_id,
    useRefreshTokens: true,
    useRefreshTokensFallback: true,
    authorizationParams: {
      redirect_uri: document.location.href,
      scope: "openid profile email",
      audience: config.default_audience,
    },
  })

  const searchParams = new URLSearchParams(document.location.search)
  const code = searchParams.get("code")
  const exchangeState = searchParams.get("state")
  if (code && exchangeState) {
    try {
      console.log("SWR: executing handleRedirectCallback...")
      await client.handleRedirectCallback()
    } catch (err) {
      console.error(err)
    }
  }

  let accessToken: string | undefined = undefined
  try {
    console.log("SWR: executing getTokenSilently...")
    accessToken = await client.getTokenSilently({
      timeoutInSeconds: 5,
    })
  } catch (err) {
    console.log(err)
  }

  let idToken: IdToken | undefined = undefined
  try {
    console.log("SWR: executing getIdTokenClaims...")
    idToken = await client.getIdTokenClaims()
  } catch (err) {
    console.log(err)
  }

  return {
    client,
    idToken,
    accessToken,
  }
}

interface ISession {
  idToken: IdToken | undefined
  accessToken: string | undefined
}

export default function Page() {
  const { data, error, isLoading } = useSWRImmutable("/api/config", createClient)
  const [state, setState] = useState<ISession>({
    idToken: undefined,
    accessToken: undefined,
  })

  if (error) {
    console.error(error)
    return <p>Something went wrong.</p>
  }
  if (isLoading || !data) {
    return <p>Loading...</p>
  }

  const { client } = data

  function login() {
    client.loginWithRedirect()
  }

  async function loginWithPopup() {
    try {
      await client.loginWithPopup()
    } catch (err) {
      console.log("loginWithPopup:", err)
      if (err instanceof PopupTimeoutError) {
        err.popup.close()
      }
    }
    await getAndDisplaySessionInfo()
  }

  function logout() {
    client.logout({
      logoutParams: {
        returnTo: document.location.href,
      },
    })
  }

  async function getAndDisplaySessionInfo() {
    let accessToken: string | undefined = undefined
    try {
      console.log("Event handler: executing getTokenSilently...")
      accessToken = await client.getTokenSilently()
    } catch (err) {
      console.log(err)
    }

    let idToken: IdToken | undefined = undefined
    try {
      console.log("Event handler: executing getIdTokenClaims...")
      idToken = await client.getIdTokenClaims()
    } catch (err) {
      console.log(err)
    }

    setState({
      idToken,
      accessToken,
    })
  }

  return (
    <main>
      <h2>Single Page Application: auth0-spa-js</h2>
      <section>
        <h3>Login and Logout</h3>
        <ul>
          <li>
            <button onClick={login}>Login with redirect</button>
          </li>
          <li>
            <button onClick={loginWithPopup}>Login with popup</button>
          </li>
          <li>
            <button onClick={getAndDisplaySessionInfo}>Get token silently</button>
          </li>
          <li>
            <button onClick={logout}>Logout</button>
          </li>
        </ul>
      </section>
      <section>
        <h3>Session Details</h3>
        <dl>
          <dt>Access Token:</dt>
          <dd>{(state.accessToken ? state.accessToken : data.accessToken) || "N/A"}</dd>

          <dt>ID Token:</dt>
          <dd>{(state.idToken ? state.idToken.__raw : data.idToken?.__raw) || "N/A"}</dd>
        </dl>
      </section>
    </main>
  )
}
