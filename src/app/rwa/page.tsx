import { auth0 } from "@/lib/auth0"

import LoginAndOut from "./LoginAndOut"
import TokenInfo from "@/components/TokenInfo"

export default async function RWAPage() {
  const session = await auth0.getSession()

  return (
    <main className="font-['Roboto',sans-serif] bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-gray-800 text-2xl font-bold">Regular Web Application</h2>
      <section className="mb-8">
        <h3 className="text-gray-800 mb-4 text-lg font-bold">Login and Logout</h3>
        <LoginAndOut />
      </section>
      <section className="mb-8">
        <h3 className="text-gray-800 mb-4 text-lg font-bold">Session Details</h3>
        {session ? <p data-testid="logged-in">(Logged in.)</p> : <></>}
        <div>
          <dl>
            <dt className="my-2 font-bold text-gray-800">Access Token:</dt>
            <dd className="m-0">
              <TokenInfo jwt={session?.tokenSet.accessToken} />
            </dd>
            <dt className="my-2 font-bold text-gray-800">ID Token:</dt>
            <dd className="m-0">
              <TokenInfo jwt={session?.tokenSet.idToken} />
            </dd>
            <dt className="my-2 font-bold text-gray-800">Refresh Token:</dt>
            <dd className="m-0">
              <p className="bg-gray-200 p-3 rounded-sm font-mono text-xs break-all">
                {session?.tokenSet.refreshToken || "N/A"}
              </p>
            </dd>
          </dl>
        </div>
      </section>
    </main>
  )
}
