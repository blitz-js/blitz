describe("admin#index page", () => {
  beforeEach(() => {
    cy.visit("/admin")
  })

  it("Has H1", () => {
    cy.visit("/admin")
    cy.contains("h1", "Store Admin")
  })

  it("goes to admin/products page", () => {
    cy.contains("a", "Manage Products").click()
    cy.location("pathname").should("equal", "/admin/products")
  })
})

export {}
