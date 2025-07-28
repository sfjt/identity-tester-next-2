export default async function fetchConfig(uri: string) {
  const res = await fetch(uri)
  const body = await res.json()
  const appBaseURL = body.app_base_url
  const auth0Domain = body.auth0_domain
  return {
    appBaseURL,
    auth0Domain,
  }
}
