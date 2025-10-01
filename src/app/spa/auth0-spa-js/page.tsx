"use client"

import { useState } from "react"
import { createAuth0Client, PopupTimeoutError } from "@auth0/auth0-spa-js"
import type { IdToken } from "@auth0/auth0-spa-js"
import useSWRImmutable from "swr/immutable"

import fetchConfig from "@/lib/fetch-config"
import TokenInfo from "@/components/TokenInfo"

async function createClient() {
  const config = await fetchConfig("/api/config")
  const client = await createAuth0Client({
    domain: config.auth0_domain,
    clientId: config.spa_client_id,
    useRefreshTokens: true,
    useRefreshTokensFallback: true,
    authorizationParams: {
      redirect_uri: document.location.origin + "/spa/auth0-spa-js",
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
  const { data, error, isLoading } = useSWRImmutable("/spa/auth0-spa-js", createClient)
  const [state, setState] = useState<ISession>({
    idToken: undefined,
    accessToken: undefined,
  })

  if (error) {
    console.error(error)
    return (
      <main>
        <p className="error">Something went wrong.</p>
      </main>
    )
  }
  if (isLoading || !data) {
    return (
      <main>
        <p className="loading">Loading...</p>
      </main>
    )
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
        returnTo: document.location.origin + "/spa/auth0-spa-js",
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
      <section className="section">
        <h3>Login and Logout</h3>
        <ul className="list-unstyled">
          <li>
            <button className="btn btn-primary" onClick={login}>
              Login with redirect
            </button>
          </li>
          <li>
            <button className="btn btn-primary" onClick={loginWithPopup}>
              Login with popup
            </button>
          </li>
          <li>
            <button className="btn btn-secondary" onClick={getAndDisplaySessionInfo}>
              Get token silently
            </button>
          </li>
          <li>
            <button className="btn btn-danger" onClick={logout}>
              Logout
            </button>
          </li>
        </ul>
      </section>
      <section className="section">
        <h3>Session Details</h3>
        <div className="session-info">
          <dl>
            <dt>Access Token:</dt>
            <dd>
              <TokenInfo jwt={state.accessToken ? state.accessToken : data.accessToken} />
            </dd>
            <dt>ID Token:</dt>
            <dd>
              <TokenInfo jwt={state.idToken ? state.idToken.__raw : data.idToken?.__raw} />
            </dd>
          </dl>
        </div>
      </section>
    </main>
  )
}
