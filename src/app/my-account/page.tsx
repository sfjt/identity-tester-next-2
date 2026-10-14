"use client"

import { withPageAuthRequired } from "@auth0/nextjs-auth0"

import PasskeyEnrollment from "./PasskeyEnrollment"

export default withPageAuthRequired(() => {
  return (
    <main className="font-['Roboto',sans-serif] bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-gray-800 text-2xl font-bold">My Account API Tester</h2>
      <PasskeyEnrollment />
    </main>
  )
})
