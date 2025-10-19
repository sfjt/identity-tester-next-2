/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen } from "@testing-library/react"
import EchoPage from "./page"

// Mock useSearchParams from next/navigation
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}))

import { useSearchParams } from "next/navigation"

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>

describe("Echo Page", () => {
  it("renders an empty table when no query parameters are provided", () => {
    mockUseSearchParams.mockReturnValue({
      entries: () => [][Symbol.iterator](),
    } as any)

    render(<EchoPage />)

    expect(screen.getByRole("table")).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Key" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Value" })).toBeInTheDocument()
  })

  it("displays a single key-value pair in the table", () => {
    mockUseSearchParams.mockReturnValue({
      entries: () => [["foo", "bar"]][Symbol.iterator](),
    } as any)

    render(<EchoPage />)

    expect(screen.getByRole("cell", { name: "foo" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "bar" })).toBeInTheDocument()
  })

  it("displays multiple key-value pairs in the table", () => {
    mockUseSearchParams.mockReturnValue({
      entries: () =>
        [
          ["name", "Alice"],
          ["age", "30"],
          ["city", "New York"],
        ][Symbol.iterator](),
    } as any)

    render(<EchoPage />)

    // Check for keys
    expect(screen.getByRole("cell", { name: "name" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "age" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "city" })).toBeInTheDocument()

    // Check for values
    expect(screen.getByRole("cell", { name: "Alice" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "30" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "New York" })).toBeInTheDocument()
  })

  it("handles special characters in query parameters", () => {
    mockUseSearchParams.mockReturnValue({
      entries: () =>
        [
          ["email", "test@email.test"],
          ["message", "Hello World!"],
          ["url", "https://url.test/path?query=1"],
        ][Symbol.iterator](),
    } as any)

    render(<EchoPage />)

    expect(screen.getByRole("cell", { name: "email" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "test@email.test" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "message" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "Hello World!" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "url" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "https://url.test/path?query=1" })).toBeInTheDocument()
  })

  it("handles empty string values", () => {
    mockUseSearchParams.mockReturnValue({
      entries: () =>
        [
          ["key1", ""],
          ["key2", "value2"],
        ][Symbol.iterator](),
    } as any)

    render(<EchoPage />)

    expect(screen.getByRole("cell", { name: "key1" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "key2" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "value2" })).toBeInTheDocument()

    // Check that there's an empty cell for key1's value
    const rows = screen.getAllByRole("row")
    // Find the row containing key1
    const key1Row = rows.find((row) => row.textContent?.includes("key1"))
    expect(key1Row?.textContent).toContain("key1")
  })
})
