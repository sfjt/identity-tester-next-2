"use client"

import useSWRImmutable from "swr/immutable"
import { ChangeEvent, useState } from "react"

import fetchConfig from "@/lib/fetch-config"
import styles from "./rwa.module.css"

export default function LoginAndOut() {
  const { data, error, isLoading } = useSWRImmutable("/api/config", fetchConfig)

  const [state, setState] = useState({
    params: new URLSearchParams(),
    editorVisible: false,
  })

  if (error) {
    console.error(error)
    return <p className="error">Something went wrong.</p>
  }

  if (isLoading || !data) {
    return <p className="loading">Loading...</p>
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
      <ul className="list-unstyled">
        <li>
          <button className="btn btn-primary" onClick={login}>
            Login
          </button>
        </li>
        <li>
          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </li>
        <li>
          <div>
            <button className="btn btn-secondary" onClick={toggleEditorVisibility}>
              {state.editorVisible ? "-" : "+"} Custom login/logout params
            </button>
            <div className={state.editorVisible ? styles["custom-params-editor"] : styles["custom-params-hidden"]}>
              <textarea onChange={parseParams} rows={10} cols={50} id="custom-params" defaultValue={`{\n  \n}`} />
              {state.params.size > 0 ? (
                <p className={styles["custom-params-valid"]}>{state.params.toString()}</p>
              ) : (
                <p className={styles["custom-params-invalid-or-empty"]}>(Invalid or empty JSON)</p>
              )}
            </div>
          </div>
        </li>
      </ul>
      <ul className="link-list">
        <li>
          <a href={v2LogoutURL}>{v2LogoutURL}</a>
        </li>
        <li>
          <a href={oidcLogoutURL}>{oidcLogoutURL}</a>
        </li>
      </ul>
    </div>
  )
}
