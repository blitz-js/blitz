/// <reference types="Cypress" />
/// <reference types="@cypress/skip-test" />

declare namespace Cypress {
  interface Chainable {
    signup(user: {email: string; password: string}): void
  }
}
