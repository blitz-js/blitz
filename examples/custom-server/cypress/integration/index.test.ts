import { createRandomUser } from "../support/helpers"

describe("index page", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("goes to the signup page", () => {
    cy.contains("a", "Sign Up").click()
    cy.location("pathname").should("equal", "/signup")
  })

  it("goes to the login page", () => {
    cy.contains("a", /login/i).click()
    cy.location("pathname").should("equal", "/login")
  })

  it("allows the user to signup", () => {
    const user = createRandomUser()

    cy.signup(user)

    cy.location("pathname").should("equal", "/")
    cy.contains("button", "Logout")
  })

  it("allows the user to log in", () => {
    const user = createRandomUser()

    cy.signup(user)

    cy.contains("button", "Logout").click()
    cy.contains("a", /login/i).click()

    cy.contains("Email").find("input").type(user.email)
    cy.contains("Password").find("input").type(user.password)
    cy.contains("button", /login/i).click()

    cy.location("pathname").should("equal", "/")
    cy.contains("button", "Logout")
  })

  it("allows the user to logout", () => {
    const user = createRandomUser()

    cy.signup(user)

    cy.contains("button", "Logout").click()

    cy.location("pathname").should("equal", "/")
    cy.contains("a", /login/i)
  })
})

export {}
