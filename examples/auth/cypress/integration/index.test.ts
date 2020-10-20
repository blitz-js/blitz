import {createRandomUser} from "../support/helpers"

describe("index page", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("goes to the signup page", () => {
    cy.contains("a", "Sign Up").click()
    cy.location("pathname").should("equal", "/signup")
  })

  it("goes to the login page", () => {
    cy.contains("a", "Login").click()
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
    cy.contains("a", "Login").click()

    cy.contains("Email").find("input").type(user.email)
    cy.contains("Password").find("input").type(user.password)
    cy.contains("button", "Login").click()

    cy.location("pathname").should("equal", "/")
    cy.contains("button", "Logout")
  })

  it("allows the user to logout", () => {
    const user = createRandomUser()

    cy.signup(user)

    cy.contains("button", "Logout").click()

    cy.location("pathname").should("equal", "/")
    cy.contains("a", "Login")
  })

  it("tracks anonymous sessions", () => {
    // TODO - why does this fail on windows??
    cy.skipOn("windows")
    const user = createRandomUser()

    cy.contains("button", "Track view").click()
    cy.contains("button", "Track view").click()
    cy.contains('"views": 2')

    cy.signup(user)

    cy.contains('"views": 2')
  })
})

export {}
