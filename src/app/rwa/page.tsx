import { auth0 } from "@/lib/auth0"
import LoginAndOut from "./LoginAndOut"
import styles from "./rwa.module.css"

export default async function RWAPage() {
  const session = await auth0.getSession()

  return (
    <main>
      <h2>Regular Web Application</h2>
      <section>
        <h3>Login and Logout</h3>
        <LoginAndOut />
        <h3>Session Details</h3>
        <dl className={styles["session-details"]}>
          <dt>Access Token:</dt>
          <dd>{session?.tokenSet.accessToken || "N/A"}</dd>
          <dt>ID Token:</dt>
          <dd>{session?.tokenSet.idToken || "N/A"}</dd>
          <dt>Refresh Token:</dt>
          <dd>{session?.tokenSet.refreshToken || "N/A"}</dd>
        </dl>
      </section>
    </main>
  )
}
