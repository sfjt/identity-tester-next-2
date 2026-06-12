export default function LoginToMyAccountAPITester() {
  return (
    <a
      href={
        "/auth/login?" +
        new URLSearchParams({
          returnTo: `${process.env.APP_BASE_URL}/my-account`,
          audience: `https://${process.env.AUTH0_DOMAIN}/me/`,
          scope:
            "openid profile email enroll offline_access create:me:authentication_methods read:me:authentication_methods update:me:authentication_methods delete:me:authentication_methods read:me:factors",
        })
      }
      className="text-primary no-underline py-2 px-3 rounded-sm bg-gray-50 border border-gray-300 transition-all inline-block hover:bg-primary hover:text-white"
    >
      My Account API Tester
    </a>
  )
}
