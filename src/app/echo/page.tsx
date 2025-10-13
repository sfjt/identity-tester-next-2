"use client"

import { useSearchParams } from "next/navigation"
import styles from "./echo.module.css"

export default function EchoPage() {
  const searchParams = useSearchParams()
  const params = Array.from(searchParams.entries())

  return (
    <main>
      <h1>Qery parameters</h1>
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
    </main>
  )
}
