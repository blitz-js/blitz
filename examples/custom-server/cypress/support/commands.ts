// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

Cypress.Commands.add("signup", ({ email, password }) => {
  cy.contains("a", "Sign Up").click()

  cy.contains("Email").find("input").type(email)
  cy.contains("Password").find("input").type(password)
  cy.contains("button", "Create Account").click()
})
