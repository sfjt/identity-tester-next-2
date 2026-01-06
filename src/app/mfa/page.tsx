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
    <main className="font-['Roboto',sans-serif] bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold">MFA API Tester</h2>

      <ErrorBoundary fallback={createMFAErrorFallback("Authenticators")}>
        <section className="mb-8">
          <Authenticators />
        </section>
      </ErrorBoundary>

      <ErrorBoundary fallback={createMFAErrorFallback("OTP Enrollment")}>
        <section className="mb-8">
          <OTPEnrollment />
        </section>
      </ErrorBoundary>

      <ErrorBoundary fallback={createMFAErrorFallback("Push Enrollment")}>
        <section className="mb-8">
          <PushEnrollment />
        </section>
      </ErrorBoundary>

      <ErrorBoundary fallback={createMFAErrorFallback("SMS Enrollment")}>
        <section className="mb-8">
          <SMSEnrollment />
        </section>
      </ErrorBoundary>
    </main>
  )
})
