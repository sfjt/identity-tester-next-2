"use client"

import Script from "next/script"

export default function Page() {
  return (
    <main className="font-['Roboto',sans-serif] bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-gray-800 text-2xl font-bold">Passkey Testing</h2>
      <section className="mb-8">
        <h3 className="text-gray-800 mb-4 text-lg font-bold">Client Capabilities</h3>
        <pre id="capabilities"></pre>
        <Script>
          {`
            ;(async function() {
              const capabilities = await window.PublicKeyCredential.getClientCapabilities()
              console.log(capabilities)
              document.getElementById("capabilities").appendChild(document.createTextNode(JSON.stringify(capabilities, null, 2)))
            })()
          `}
        </Script>
      </section>
    </main>
  )
}
