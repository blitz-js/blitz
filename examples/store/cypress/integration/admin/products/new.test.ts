import {insert} from "./helper"

describe("admin/products/new page", () => {
  beforeEach(() => {
    cy.visit("/admin/products/new")
  })

  it("Has h1 and link back", () => {
    cy.contains("h1", "Create a New Product")
    cy.get("p > a").first().contains("Manage Products").click()
    cy.location("pathname").should("equal", "/admin/products")
  })

  it("Fills fields and creates product", () => {
    insert()
  })
})

export {}
