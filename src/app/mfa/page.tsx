"use client"

import { withPageAuthRequired } from "@auth0/nextjs-auth0"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import Authenticators from "./Authenticators"
import OTPEnrollment from "./OTPEnrollment"
import PushEnrollment from "./PushEnrollment"
import SMSEnrollment from "./SMSEnrollment"
import MFAErrorFallback from "./MFAErrorFallback"

const createMFAErrorFallback = (componentName: string) => {
  const fallback = (error: Error) => <MFAErrorFallback error={error} componentName={componentName} />
  fallback.displayName = `MFAErrorFallback(${componentName})`
  return fallback
}

export default withPageAuthRequired(() => {
  return (
    <main>
      <h2>MFA API Tester</h2>

      <ErrorBoundary fallback={createMFAErrorFallback("Authenticators")}>
        <section className="section">
          <Authenticators />
        </section>
      </ErrorBoundary>

      <ErrorBoundary fallback={createMFAErrorFallback("OTP Enrollment")}>
        <section className="section">
          <OTPEnrollment />
        </section>
      </ErrorBoundary>

      <ErrorBoundary fallback={createMFAErrorFallback("Push Enrollment")}>
        <section className="section">
          <PushEnrollment />
        </section>
      </ErrorBoundary>

      <ErrorBoundary fallback={createMFAErrorFallback("SMS Enrollment")}>
        <section className="section">
          <SMSEnrollment />
        </section>
      </ErrorBoundary>
    </main>
  )
})
