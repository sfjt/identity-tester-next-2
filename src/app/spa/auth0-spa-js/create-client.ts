import { createAuth0Client, RefreshTokenMode } from "@auth0/auth0-spa-js"
import type { IdToken } from "@auth0/auth0-spa-js"

import fetchConfig from "@/lib/fetch-config"

export async function createClient() {
  const config = await fetchConfig()
  const clientParams: any = {
    domain: config.auth0_domain,
    clientId: config.spa_client_id,
    useRefreshTokens: true,
    authorizationParams: {
      redirect_uri: document.location.origin + "/spa/auth0-spa-js",
      audience: config.default_audience,
    },
  }

  const searchParams = new URLSearchParams(document.location.search)
  const useOrt = searchParams.get("use_ort") === "true"
  if (useOrt) {
    console.log("SWR: using online refresh token mode")
    clientParams.useDpop = true
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
    console.log("SWR: executing getTokenSilently (cache-only)...")
    accessToken = await client.getTokenSilently({
      timeoutInSeconds: 5,
      cacheMode: "cache-only",
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
    config,
    client,
    idToken,
    accessToken,
  }
}
