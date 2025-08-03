"use client"

import { withPageAuthRequired } from "@auth0/nextjs-auth0"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import Authenticators from "./Authenticators"
import OTPEnrollment from "./OTPEnrollment"
import PushEnrollment from "./PushEnrollment"
import MFAErrorFallback from "./MFAErrorFallback"
import styles from "./mfa.module.css"

const createMFAErrorFallback = (componentName: string) => {
  const fallback = (error: Error) => <MFAErrorFallback error={error} componentName={componentName} />
  fallback.displayName = `MFAErrorFallback(${componentName})`
  return fallback
}

export default withPageAuthRequired(() => {
  return (
    <main>
      <h2>MFA API Tester</h2>

      <div className={`section ${styles["security-notice"]}`}>
        <h3>⚠️ Security Notice</h3>
        <p>
          <strong>Testing Application:</strong> This app exposes the MFA API access token to the frontend for testing
          convenience.
        </p>
      </div>

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
    </main>
  )
})
