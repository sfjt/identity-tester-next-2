"use client"

import useSWRImmutable from "swr/immutable"
import { ChangeEvent, useState } from "react"

import fetchConfig from "@/lib/fetchConfig"
import styles from "./rwa.module.css"

export default function LoginAndOut() {
  const { data, error, isLoading } = useSWRImmutable("/api/config", fetchConfig)

  const [state, setState] = useState({
    params: new URLSearchParams(),
    editorVisible: false,
  })

  if (error) {
    console.error(error)
    return <p>Something went wrong.</p>
  }

  if (isLoading || !data) {
    return <p>Loading...</p>
  }

  const defaultReturnTo = `${data.app_base_url}/rwa`
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
      params.append("returnTo", defaultReturnTo)
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
      <ul>
        <li>
          <button onClick={login}>Login</button>
        </li>
        <li>
          <button onClick={logout}>Logout</button>
        </li>
        <li>
          <div>
            <label onClick={toggleEditorVisibility} htmlFor="custom-params" className={styles["custom-params-label"]}>
              <button>{state.editorVisible ? "-" : "+"} Custom login/logout params</button>
            </label>
            <div className={state.editorVisible ? "" : styles["custom-params-hidden"]}>
              <p>
                <textarea
                  onChange={parseParams}
                  rows={10}
                  cols={50}
                  id="custom-params"
                  defaultValue={`{\n  \n}`}
                ></textarea>
              </p>
              {state.params.size > 0 ? (
                <p className={styles["custom-params-valid"]}>{state.params.toString()}</p>
              ) : (
                <p className={styles["custom-params-invalid-or-empty"]}>(Invalid or empty JSON)</p>
              )}
            </div>
          </div>
        </li>
      </ul>
      <ul>
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
