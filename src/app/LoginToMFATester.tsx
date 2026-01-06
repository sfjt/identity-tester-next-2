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
      className="text-primary no-underline py-2 px-3 rounded bg-gray-50 border border-gray-300 transition-all inline-block hover:bg-primary hover:text-white"
    >
      MFA API Tester
    </a>
  )
}
