import { insert } from "./helper"

describe("admin/products page", () => {
  beforeEach(() => {
    cy.visit("/admin/products")
  })

  it("Has H1", () => {
    cy.contains("h1", "Products")
  })

  it("goes to new product page", () => {
    cy.get("p > a").first().contains("Create Product").click()
    cy.location("pathname").should("equal", "/admin/products/new")
  })

  it("goes to bas product page", () => {
    cy.get("p > a").last().contains("Admin").click()
    cy.location("pathname").should("equal", "/admin")
  })

  // This is kind of redundant because this logic is handled in insert()
  it("shows latest created product", () => {
    const name = insert()
    cy.get("ul > li").contains(name)
  })
})

export {}
