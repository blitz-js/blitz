// global-setup.ts
import { chromium, expect, FullConfig } from "@playwright/test"

async function globalSetup(config: FullConfig) {
  if (!config.projects[0]) throw new Error("You need to define projects")
  const { baseURL, storageState } = config.projects[0].use

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(`${baseURL}/auth/login`)
  await page.locator("input[name='email']").fill("e2e@user.de")
  await page.locator("input[name='password']").fill("e2euserpassword")
  await page.getByRole("button").click()
  await expect(page.locator("button", { hasText: "Logout" })).toBeDefined()

  await page.context().storageState({ path: storageState as string })
  await browser.close()
}

export default globalSetup
