export default async function fetchConfig() {
  const res = await fetch("/api/config")
  const body = await res.json()
  return {
    ...body,
  }
}
