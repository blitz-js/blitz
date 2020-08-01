/// <reference types="Cypress" />

declare namespace Cypress {
  interface Chainable {
    signup(user: {email: string; password: string}): void
  }
}
