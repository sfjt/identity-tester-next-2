"use client"

import { withPageAuthRequired } from "@auth0/nextjs-auth0"
import Authenticators from "./Authenticators"

export default withPageAuthRequired(function MFAPage() {
  return (
    <main>
      <h2>MFA API Tester</h2>
      <section className="section">
        <Authenticators />
      </section>
    </main>
  )
})
