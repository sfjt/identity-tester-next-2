"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

function EchoTable() {
  const searchParams = useSearchParams()
  const params = Array.from(searchParams.entries())

  return (
    <table className="border-collapse w-full mt-5">
      <thead>
        <tr>
          <th className="border border-gray-300 p-3 text-left bg-gray-100 font-bold">Key</th>
          <th className="border border-gray-300 p-3 text-left bg-gray-100 font-bold">Value</th>
        </tr>
      </thead>
      <tbody>
        {params.map(([key, value]) => (
          <tr key={key} className="hover:bg-gray-50">
            <td className="border border-gray-300 p-3">{key}</td>
            <td className="border border-gray-300 p-3">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function EchoPage() {
  return (
    <main>
      <h1>Qery parameters</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <EchoTable />
      </Suspense>
    </main>
  )
}
