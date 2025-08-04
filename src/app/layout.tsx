import type { Metadata } from "next"

import "@/app/globals.css"
import LoginToMFATester from "./LoginToMFATester"

export const metadata: Metadata = {
  title: "Identity Tester",
  description: "Auth0 All In One Tester",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <header className="app-header">
            <h1>Identity Tester Next</h1>
            <nav>
              <ul className="nav-list">
                <li>
                  <a href="/rwa">Regular Web Application</a>
                </li>
                <li>
                  <a href="/spa/auth0-spa-js">Single Page Application (auth0-spa-js)</a>
                </li>
                <li>
                  <a href="/spa/auth0-lock">Single Page Application (auth0-lock)</a>
                </li>
                <li>
                  <a href="/spa/auth0-js">Single Page Application (auth0.js)</a>
                </li>
                <li>
                  <LoginToMFATester />
                </li>
              </ul>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
