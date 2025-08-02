"use client"

import { withPageAuthRequired } from "@auth0/nextjs-auth0"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import Authenticators from "./Authenticators"
import OTPEnrollment from "./OTPEnrollment"
import PushEnrollment from "./PushEnrollment"
import MFAErrorFallback from "./MFAErrorFallback"

export default withPageAuthRequired(() => {
  return (
    <main>
      <h2>MFA API Tester</h2>

      <ErrorBoundary fallback={<MFAErrorFallback componentName="Authenticators" />}>
        <section className="section">
          <Authenticators />
        </section>
      </ErrorBoundary>

      <ErrorBoundary fallback={<MFAErrorFallback componentName="OTP Enrollment" />}>
        <section className="section">
          <OTPEnrollment />
        </section>
      </ErrorBoundary>

      <ErrorBoundary fallback={<MFAErrorFallback componentName="Push Enrollment" />}>
        <section className="section">
          <PushEnrollment />
        </section>
      </ErrorBoundary>
    </main>
  )
})
