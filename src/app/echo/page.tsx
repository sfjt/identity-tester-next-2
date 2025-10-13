"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import styles from "./echo.module.css"

function EchoTable() {
  const searchParams = useSearchParams()
  const params = Array.from(searchParams.entries())

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {params.map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>{value}</td>
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
