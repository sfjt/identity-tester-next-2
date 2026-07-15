"use client"

import { useState } from "react"
import type { ChangeEvent } from "react"
import { createAuth0Client, PopupTimeoutError, RefreshTokenMode } from "@auth0/auth0-spa-js"
import type { IdToken, Auth0ClientOptions } from "@auth0/auth0-spa-js"
import useSWRImmutable from "swr/immutable"

import fetchConfig from "@/lib/fetch-config"
import TokenInfo from "@/components/TokenInfo"

async function createClient() {
  const config = await fetchConfig()
  const clientParams: any = {
    domain: config.auth0_domain,
    clientId: config.spa_client_id,
    useRefreshTokens: true,
    useRefreshTokensFallback: true,
    useDpop: true,
    authorizationParams: {
      redirect_uri: document.location.origin + "/spa/auth0-spa-js",
      scope: "openid profile email",
      audience: config.default_audience,
    },
  }

  const searchParams = new URLSearchParams(document.location.search)
  const useOrt = searchParams.get("use_ort") === "true"
  if (useOrt) {
    console.log("SWR: using online refresh token mode")
    clientParams.refreshTokenMode = RefreshTokenMode.Online
    clientParams.authorizationParams.redirect_uri = document.location.origin + "/spa/auth0-spa-js?use_ort=true"
  }

  const client = await createAuth0Client(clientParams)

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

interface IState {
  params: { [key: string]: any }
  idToken: IdToken | undefined
  accessToken: string | undefined
  editorVisible: boolean
}

export default function Page() {
  const { data, error, isLoading } = useSWRImmutable("/spa/auth0-spa-js", createClient)
  const [state, setState] = useState<IState>({
    idToken: undefined,
    accessToken: undefined,
    params: {},
    editorVisible: false,
  })

  if (error) {
    console.error(error)
    return (
      <main className="font-['Roboto',sans-serif] bg-white p-8 rounded-lg shadow-md">
        <p className="text-danger bg-red-100 p-4 rounded-sm my-4">Something went wrong.</p>
      </main>
    )
  }
  if (isLoading || !data) {
    return (
      <main className="font-['Roboto',sans-serif] bg-white p-8 rounded-lg shadow-md">
        <p className="text-center text-gray-600 p-5">Loading...</p>
      </main>
    )
  }

  const { client } = data

  function login() {
    client.loginWithRedirect({ authorizationParams: { ...state.params } })
  }

  async function loginWithPopup() {
    try {
      await client.loginWithPopup({ authorizationParams: { ...state.params } })
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
        ...state.params,
        returnTo: document.location.origin + "/spa/auth0-spa-js",
      },
    })
  }

  async function getAndDisplaySessionInfo(ignoreCache = false) {
    let accessToken: string | undefined = undefined
    try {
      console.log("Event handler: executing getTokenSilently...")
      console.log("ignoreCache:", ignoreCache)
      if (ignoreCache) {
        accessToken = await client.getTokenSilently({ cacheMode: "off" })
      }
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
      ...state,
      idToken,
      accessToken,
    })
  }

  function toggleEditorVisibility() {
    setState({
      ...state,
      editorVisible: !state.editorVisible,
    })
  }

  function parseParams(event: ChangeEvent<HTMLTextAreaElement>) {
    const v = event.target.value
    if (!v) {
      return
    }

    let j = {}
    try {
      j = JSON.parse(v)
    } catch {
      setState({
        ...state,
        params: {},
      })
      return
    }
    setState({
      ...state,
      params: j,
    })
  }

  return (
    <main className="font-['Roboto',sans-serif] bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-gray-800 text-2xl font-bold">Single Page Application: auth0-spa-js</h2>
      <section className="mb-8">
        <h3 className="text-gray-800 mb-4 text-lg font-bold">Login and Logout</h3>
        <ul className="list-none p-0 m-0">
          <li className="mb-3 mt-2">
            <button
              className="border-0 rounded-sm cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-primary text-white hover:bg-blue-700"
              onClick={login}
            >
              Login with redirect
            </button>
          </li>
          <li className="mb-3 mt-2">
            <button
              className="border-0 rounded-sm cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-primary text-white hover:bg-blue-700"
              onClick={loginWithPopup}
            >
              Login with popup
            </button>
          </li>
          <li className="mb-3 mt-2">
            <button
              className="border-0 rounded-sm cursor-pointer transition-colors bg-secondary text-white text-sm py-2 px-4 m-1 hover:bg-gray-700"
              onClick={() => getAndDisplaySessionInfo(true)}
            >
              Get token silently
            </button>
          </li>
          <li className="mb-3 mt-2">
            <button
              className="border-0 rounded-sm cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-danger text-white hover:bg-red-700"
              onClick={logout}
            >
              Logout
            </button>
          </li>
          <li className="mb-3 mt-2">
            <div>
              <button
                className="border-0 rounded-sm cursor-pointer transition-colors bg-secondary text-white text-sm py-2 px-4 m-1 hover:bg-gray-700"
                onClick={toggleEditorVisibility}
              >
                {state.editorVisible ? "-" : "+"} Custom login/logout params
              </button>
              <div className={state.editorVisible ? "bg-gray-50 p-4 rounded-sm mt-3" : "hidden"}>
                <textarea
                  onChange={parseParams}
                  rows={10}
                  cols={50}
                  id="custom-params"
                  defaultValue={`{\n  \n}`}
                  className="w-full max-w-full border border-gray-400 rounded-sm p-3 font-mono text-sm resize-y bg-white box-border focus:outline-hidden focus:border-primary focus:shadow-[0_0_0_2px_rgba(0,123,255,0.25)]"
                />
                {Object.keys(state.params).length > 0 ? (
                  <p className="text-success bg-green-100 py-2 px-3 rounded-sm font-mono text-xs mt-3 break-all">
                    {new URLSearchParams(state.params).toString()}
                  </p>
                ) : (
                  <p className="text-danger bg-red-100 py-2 px-3 rounded-sm text-sm mt-3">(Invalid or empty JSON)</p>
                )}
              </div>
            </div>
          </li>
        </ul>
      </section>
      <section className="mb-8">
        <h3 className="text-gray-800 mb-4 text-lg font-bold">Session Details</h3>
        <div>
          <dl>
            <dt className="my-2 font-bold text-gray-800">Access Token:</dt>
            <dd className="m-0">
              <TokenInfo jwt={state.accessToken ? state.accessToken : data.accessToken} />
            </dd>
            <dt className="my-2 font-bold text-gray-800">ID Token:</dt>
            <dd className="m-0">
              <TokenInfo jwt={state.idToken ? state.idToken.__raw : data.idToken?.__raw} />
            </dd>
          </dl>
        </div>
      </section>
    </main>
  )
}
