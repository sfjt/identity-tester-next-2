export default function LoginToMFATester() {
  return (
    <a
      href={
        "/auth/login?" +
        new URLSearchParams({
          returnTo: `${process.env.APP_BASE_URL}/mfa`,
          audience: `https://dev-lab-sf.us.auth0.com/mfa/`,
          scope: "openid profile email enroll read:authenticators remove:authenticators",
        })
      }
    >
      MFA API Tester
    </a>
  )
}
