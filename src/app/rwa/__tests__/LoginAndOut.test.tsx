import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import LoginAndOut from "../LoginAndOut"
import fetchConfig from "@/lib/fetch-config"

jest.mock("@/lib/fetchConfig")

const mockConfig = {
  auth0_domain: "example.com",
  default_audience: "https://api.example.com",
}

const renderWithSWR = (ui: React.ReactElement, { fallback = {} } = {}) => {
  return render(<SWRConfig value={{ fallback, provider: () => new Map() }}>{ui}</SWRConfig>)
}

describe("LoginAndOut Component", () => {
  it("renders loading state initially", () => {
    renderWithSWR(<LoginAndOut />)
    expect(screen.getByText("Loading...")).toBeVisible()
  })

  it("renders error state when config fetch fails", async () => {
    const mockedFetchConfig = fetchConfig as jest.MockedFunction<typeof fetchConfig>
    mockedFetchConfig.mockRejectedValueOnce(new Error("Config fetch failed"))

    renderWithSWR(<LoginAndOut />)

    await waitFor(() => {
      expect(screen.getByText("Something went wrong.")).toBeVisible()
    })
  })

  it("renders login and logout buttons when config is loaded", () => {
    renderWithSWR(<LoginAndOut />, {
      fallback: {
        "/api/config": mockConfig,
      },
    })

    expect(screen.getByRole("button", { name: "Login" })).toBeVisible()
    expect(screen.getByRole("button", { name: "Logout" })).toBeVisible()
  })

  it("renders logout URLs when config is loaded", () => {
    renderWithSWR(<LoginAndOut />, {
      fallback: {
        "/api/config": mockConfig,
      },
    })

    const v2LogoutURL = `https://${mockConfig.auth0_domain}/v2/logout`
    const oidcLogoutURL = `https://${mockConfig.auth0_domain}/oidc/logout`

    expect(screen.getByRole("link", { name: v2LogoutURL })).toBeVisible()
    expect(screen.getByRole("link", { name: oidcLogoutURL })).toBeVisible()
  })

  it("toggles custom params editor visibility", () => {
    renderWithSWR(<LoginAndOut />, {
      fallback: {
        "/api/config": mockConfig,
      },
    })

    const toggleButton = screen.getByRole("button", { name: /Custom login\/logout params/ })
    expect(toggleButton.textContent).toContain("+")

    fireEvent.click(toggleButton)
    expect(toggleButton.textContent).toContain("-")

    fireEvent.click(toggleButton)
    expect(toggleButton.textContent).toContain("+")
  })

  it("parses valid JSON parameters", () => {
    renderWithSWR(<LoginAndOut />, {
      fallback: {
        "/api/config": mockConfig,
      },
    })

    const toggleButton = screen.getByRole("button", { name: /Custom login\/logout params/ })
    fireEvent.click(toggleButton)

    const textarea = screen.getByRole("textbox")
    fireEvent.change(textarea, {
      target: { value: '{"scope": "openid profile", "prompt": "login"}' },
    })

    expect(screen.getByText("scope=openid+profile&prompt=login")).toBeInTheDocument()
  })

  it("handles invalid JSON parameters", () => {
    renderWithSWR(<LoginAndOut />, {
      fallback: {
        "/api/config": mockConfig,
      },
    })

    const toggleButton = screen.getByRole("button", { name: /Custom login\/logout params/ })
    fireEvent.click(toggleButton)

    const textarea = screen.getByRole("textbox")
    fireEvent.change(textarea, {
      target: { value: '{"invalid": json}' },
    })

    expect(screen.getByText("(Invalid or empty JSON)")).toBeInTheDocument()
  })

  it("handles empty JSON parameters", () => {
    renderWithSWR(<LoginAndOut />, {
      fallback: {
        "/api/config": mockConfig,
      },
    })

    const toggleButton = screen.getByRole("button", { name: /Custom login\/logout params/ })
    fireEvent.click(toggleButton)

    const textarea = screen.getByRole("textbox")
    fireEvent.change(textarea, {
      target: { value: "" },
    })

    expect(screen.getByText("(Invalid or empty JSON)")).toBeInTheDocument()
  })
})
