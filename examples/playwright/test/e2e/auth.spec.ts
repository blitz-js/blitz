import { expect, test } from "@playwright/test"

// overwrites global-setup auth action
test.use({ storageState: { cookies: [], origins: [] } })

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/Home/)
})
test("login", async ({ page }) => {
  await page.getByText("Login").click()
  await expect(page).toHaveTitle(/Log In/)

  await page.locator("input[name='email']").fill("e2e@user.de")
  await page.locator("input[name='password']").fill("e2euserpassword")

  await page.getByRole("button").click()

  await expect(page.getByText("Logout")).toBeDefined()
})

test("user account can be created", async ({ page, browserName }) => {
  await page.getByText("Sign Up").click()
  await expect(page).toHaveTitle("Sign Up")

  await page.locator("input[name='email']").fill(`${browserName}@user.de`)
  await page.locator("input[name='password']").fill("e2e-password")

  await page.getByRole("button").click()

  await expect(page.getByText("Logout")).toBeDefined()
})

test("user can logout after login", async ({ page }) => {
  await page.getByText("Login").click()
  await page.locator("input[name='email']").fill("e2e@user.de")
  await page.locator("input[name='password']").fill("e2euserpassword")

  await page.getByRole("button").click()

  await expect(page.getByText("Logout")).toBeDefined()

  await page.getByText("Logout").click()

  await page.goto("/recipes/new")

  await expect(page.getByText("Error: You are not authenticated")).toBeDefined()
})
