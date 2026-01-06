"use client"

import useSWRImmutable from "swr/immutable"
import { ChangeEvent, useState } from "react"

import fetchConfig from "@/lib/fetch-config"

export default function LoginAndOut() {
  const { data, error, isLoading } = useSWRImmutable("/api/config", fetchConfig)

  const [state, setState] = useState({
    params: new URLSearchParams(),
    editorVisible: false,
  })

  if (error) {
    console.error(error)
    return <p className="text-danger bg-red-100 p-4 rounded my-4">Something went wrong.</p>
  }

  if (isLoading || !data) {
    return <p className="text-center text-gray-600 p-5">Loading...</p>
  }

  const v2LogoutURL = `https://${data.auth0_domain}/v2/logout`
  const oidcLogoutURL = `https://${data.auth0_domain}/oidc/logout`

  function login() {
    window.location.href = addParams("/auth/login")
  }

  function logout() {
    window.location.href = addParams("/auth/logout")
  }

  function addParams(route: string) {
    const params = new URLSearchParams(state.params)
    if (!params.has("returnTo")) {
      params.append("returnTo", window.location.href)
    }
    if (!params.has("audience") && typeof data.default_audience === "string") {
      params.append("audience", data.default_audience)
    }
    return `${route}?${params.toString()}`
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
        params: new URLSearchParams(),
      })
      return
    }
    setState({
      ...state,
      params: new URLSearchParams(j),
    })
  }

  return (
    <div>
      <ul className="list-none p-0 m-0">
        <li className="mb-3 mt-2">
          <button
            className="border-0 rounded cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-primary text-white hover:bg-blue-700"
            onClick={login}
          >
            Login
          </button>
        </li>
        <li className="mb-3 mt-2">
          <button
            className="border-0 rounded cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-danger text-white hover:bg-red-700"
            onClick={logout}
          >
            Logout
          </button>
        </li>
        <li className="mb-3 mt-2">
          <div>
            <button
              className="border-0 rounded cursor-pointer transition-colors bg-secondary text-white text-sm py-2 px-4 m-1 hover:bg-gray-700"
              onClick={toggleEditorVisibility}
            >
              {state.editorVisible ? "-" : "+"} Custom login/logout params
            </button>
            <div className={state.editorVisible ? "bg-gray-50 p-4 rounded mt-3" : "hidden"}>
              <textarea
                onChange={parseParams}
                rows={10}
                cols={50}
                id="custom-params"
                defaultValue={`{\n  \n}`}
                className="w-full max-w-full border border-gray-400 rounded p-3 font-mono text-sm resize-y bg-white box-border focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(0,123,255,0.25)]"
              />
              {state.params.size > 0 ? (
                <p className="text-success bg-green-100 py-2 px-3 rounded font-mono text-xs mt-3 break-all">
                  {state.params.toString()}
                </p>
              ) : (
                <p className="text-danger bg-red-100 py-2 px-3 rounded text-sm mt-3">(Invalid or empty JSON)</p>
              )}
            </div>
          </div>
        </li>
      </ul>
      <ul className="list-none p-0 m-0">
        <li>
          <a href={v2LogoutURL} className="text-primary no-underline text-sm break-all hover:underline">
            {v2LogoutURL}
          </a>
        </li>
        <li>
          <a href={oidcLogoutURL} className="text-primary no-underline text-sm break-all hover:underline">
            {oidcLogoutURL}
          </a>
        </li>
      </ul>
    </div>
  )
}
