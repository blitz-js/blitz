describe("Signup", () => {
  it("creates new account", () => {
    const attrs = { email: "blitz@example.com", password: "superstrongpassword" }

    cy.visit("/signup").wait(100)

    cy.findByLabelText(/email/i).type(attrs.email)
    cy.findByLabelText(/password/i).type(attrs.password)
    cy.findAllByRole("button", { name: /create account/i }).click()

    cy.location("pathname").should("equal", "/")
    cy.findByText(/logout/i).should("exist")
  })
})
