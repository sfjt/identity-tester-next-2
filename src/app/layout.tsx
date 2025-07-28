import type { Metadata } from "next"

import "@/app/globals.css"

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
        <header>
          <h1>Identity Tester Next</h1>
          <ul>
            <li>
              <a href="/rwa">Regular Web Application</a>
            </li>
          </ul>
        </header>
        {children}
      </body>
    </html>
  )
}
