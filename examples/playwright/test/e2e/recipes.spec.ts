import { expect, test } from "@playwright/test"
import { Routes } from "@blitzjs/next"

test.describe("test recipes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(Routes.RecipesPage().href)
    await expect(page.getByText("Loading...")).toBeHidden()
  })

  test("Should be able to create a new recipe", async ({ page }) => {
    await page.getByText("Create Recipe").click()
    await page.locator('input[name="name"]').type("Added Recipe")
    await page.getByRole("button").click()

    await expect(page.getByText("Added Recipe")).toBeDefined()
  })
})
