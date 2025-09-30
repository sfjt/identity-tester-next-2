import { auth0 } from "@/lib/auth0"
import LoginAndOut from "./LoginAndOut"

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
        <div className="user-info">
          <dl>
            <dt>Access Token:</dt>
            <dd>{session?.tokenSet.accessToken || "N/A"}</dd>
            <dt>ID Token:</dt>
            <dd>{session?.tokenSet.idToken || "N/A"}</dd>
            <dt>Refresh Token:</dt>
            <dd>{session?.tokenSet.refreshToken || "N/A"}</dd>
          </dl>
        </div>
      </section>
    </main>
  )
}
