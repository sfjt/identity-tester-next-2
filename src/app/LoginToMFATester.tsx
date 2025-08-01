export default function LoginToMFATester() {
  return (
    <a
      href={
        "/auth/login?" +
        new URLSearchParams({
          returnTo: `${process.env.APP_BASE_URL}/mfa`,
          audience: process.env.MFA_API_AUDIENCE || "",
          scope: "openid profile email enroll read:authenticators remove:authenticators",
        })
      }
    >
      MFA API Tester
    </a>
  )
}
