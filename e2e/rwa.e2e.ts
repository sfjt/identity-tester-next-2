import path from "path"

import { test, expect } from "@playwright/test"
import dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const e2eTestEmail = process.env.E2E_TEST_EMAIL || ""
const e2eTestPassword = process.env.E2E_TEST_PASSWORD || ""

test("login", async ({ page }) => {
  await page.goto("/rwa")
  await page.getByRole("button", { name: "Login", exact: true }).click()

  if (await page.getByRole("textbox", { name: "Password" }).isVisible()) {
    // Identifier + Password
    await page.getByRole("textbox", { name: "Email address" }).fill(e2eTestEmail)
    await page.getByRole("textbox", { name: "Password" }).fill(e2eTestPassword)
    await page.getByRole("button", { name: "Continue", exact: true }).click()
  } else {
    // Identifier First
    await page.getByRole("textbox", { name: "Email address" }).fill(e2eTestEmail)
    await page.getByRole("button", { name: "Continue", exact: true }).click()
    await page.getByRole("textbox", { name: "Password" }).fill(e2eTestPassword)
    await page.getByRole("button", { name: "Continue", exact: true }).click()
  }

  if (await page.getByRole("heading", { name: "Authorize App" }).isVisible()) {
    // Consent Screen
    await page.getByRole("button", { name: "Accept" }).click()
  }

  expect(page.getByText("(Logged in.)")).toBeVisible()
})
