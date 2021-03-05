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
    cy.contains("a", /login/i).click()
    cy.location("pathname").should("equal", "/login")
  })

  it("allows the user to signup", () => {
    const user = createRandomUser()

    cy.signup(user)
    cy.wait(1000)

    cy.location("pathname").should("equal", "/")
    cy.contains("button", "Logout")
  })

  it("allows the user to log in", () => {
    const user = createRandomUser()

    cy.signup(user)
    cy.wait(1000)

    cy.contains("button", "Logout").click()
    cy.wait(1000)
    cy.contains("a", /login/i).click()

    cy.contains("Email").find("input").type(user.email)
    cy.contains("Password").find("input").type(user.password)
    cy.contains("button", /login/i).click()

    cy.location("pathname").should("equal", "/")
    cy.wait(1000)
    cy.contains("button", "Logout")
  })

  it("allows the user to logout", () => {
    const user = createRandomUser()

    cy.signup(user)
    cy.wait(1000)

    cy.contains("button", "Logout").click()

    cy.location("pathname").should("equal", "/")
    cy.wait(1000)
    cy.contains("a", /login/i)
  })

  it("tracks anonymous sessions", () => {
    // TODO - why does this fail on windows??
    cy.skipOn("windows")
    const user = createRandomUser()

    cy.contains("button", "Track view").click()
    cy.wait(500)
    cy.contains("button", "Track view").click()
    cy.wait(1000)
    cy.contains('"views": 2')

    cy.signup(user)
    cy.wait(1000)

    cy.contains('"views": 2')
  })
})

export {}
