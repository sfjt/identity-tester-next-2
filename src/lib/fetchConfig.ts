export default async function fetchConfig(uri: string) {
  const res = await fetch(uri)
  const body = await res.json()
  return {
    ...body,
  }
}
