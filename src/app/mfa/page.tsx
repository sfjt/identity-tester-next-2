"use client"

import { withPageAuthRequired } from "@auth0/nextjs-auth0"
import Authenticators from "./Authenticators"

export default withPageAuthRequired(function RWAPage() {
  return (
    <main>
      <h2>MFA API Tester</h2>
      <Authenticators />
    </main>
  )
})
