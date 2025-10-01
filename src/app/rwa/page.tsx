import { auth0 } from "@/lib/auth0"

import LoginAndOut from "./LoginAndOut"
import TokenInfo from "@/components/TokenInfo"

export default async function RWAPage() {
  const session = await auth0.getSession()

  return (
    <main>
      <h2>Regular Web Application</h2>
      <section className="section">
        <h3>Login and Logout</h3>
        <LoginAndOut />
      </section>
      <section className="section">
        <h3>Session Details</h3>
        {session ? <p data-testid="logged-in">(Logged in.)</p> : <></>}
        <div className="session-info">
          <dl>
            <dt>Access Token:</dt>
            <dd>
              <TokenInfo jwt={session?.tokenSet.accessToken} />
            </dd>
            <dt>ID Token:</dt>
            <dd>
              <TokenInfo jwt={session?.tokenSet.idToken} />
            </dd>
            <dt>Refresh Token:</dt>
            <dd>
              <p className="token">{session?.tokenSet.refreshToken || "N/A"}</p>
            </dd>
          </dl>
        </div>
      </section>
    </main>
  )
}
