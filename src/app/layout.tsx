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
        <div className="max-w-3xl mx-auto p-5">
          <header className="bg-white p-5 md:px-8 rounded-lg shadow-md mb-5">
            <h1 className="m-0 mb-5 text-gray-800 text-3xl font-bold">Identity Tester Next</h1>
            <nav>
              <ul className="list-none p-0 m-0 flex flex-wrap gap-4">
                <li className="m-0">
                  <a
                    href="/rwa"
                    className="text-primary no-underline py-2 px-3 rounded-sm bg-gray-50 border border-gray-300 transition-all inline-block hover:bg-primary hover:text-white"
                  >
                    Regular Web Application
                  </a>
                </li>
                <li className="m-0">
                  <a
                    href="/spa/auth0-spa-js"
                    className="text-primary no-underline py-2 px-3 rounded-sm bg-gray-50 border border-gray-300 transition-all inline-block hover:bg-primary hover:text-white"
                  >
                    Single Page Application (auth0-spa-js)
                  </a>
                </li>
                <li className="m-0">
                  <a
                    href="/spa/auth0-lock"
                    className="text-primary no-underline py-2 px-3 rounded-sm bg-gray-50 border border-gray-300 transition-all inline-block hover:bg-primary hover:text-white"
                  >
                    Single Page Application (auth0-lock)
                  </a>
                </li>
                <li className="m-0">
                  <a
                    href="/spa/auth0-js"
                    className="text-primary no-underline py-2 px-3 rounded-sm bg-gray-50 border border-gray-300 transition-all inline-block hover:bg-primary hover:text-white"
                  >
                    Single Page Application (auth0.js)
                  </a>
                </li>
                <li className="m-0">
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
