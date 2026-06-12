"use client"

import { withPageAuthRequired } from "@auth0/nextjs-auth0"
import useSWRImmutable from "swr/immutable"

import PasskeyEnrollment from "./PasskeyEnrollment"
import fetchConfig from "@/lib/fetch-config"

export default withPageAuthRequired(() => {
  const { data, error, isLoading } = useSWRImmutable("/api/config", fetchConfig)
  if (error) {
    console.error(error)
    return <p className="text-danger bg-red-100 p-4 rounded-sm my-4">Something went wrong.</p>
  }

  if (isLoading || !data) {
    return <p className="text-center text-gray-600 p-5">Loading...</p>
  }

  return (
    <main className="font-['Roboto',sans-serif] bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-gray-800 text-2xl font-bold">My Account API Tester</h2>
      <PasskeyEnrollment config={data} />
    </main>
  )
})
