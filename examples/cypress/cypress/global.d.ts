declare namespace Cypress {
  export interface Chainable {
    // task for totally resetting the database
    task(event: "db:reset", options?: Partial<Loggable & Timeoutable>): Chainable<boolean>
    // task for deleting db data without dropping tables
    task(event: "db:clear", options?: Partial<Loggable & Timeoutable>): Chainable<boolean>
    // task for seeding db with essential data for tests
    task(event: "db:seed", options?: Partial<Loggable & Timeoutable>): Chainable<boolean>

    // task for creating a new factory
    task(
      event: "factory",
      args: { name: string; attrs?: any },
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<any>

    /**
     * Logs-in user by using API request
     */
    login({ email: string, password: string }): Chainable<Response>
  }
}
