describe('The New Post Page', () => {
  it('successfuly loads', () => {
    cy.visit('/posts/new')

    cy.findByText(/new post/i).should('exist')
  })

  it('links back to posts page', () => {
    cy.visit('/posts/new')

    cy.findByText(/cancel/i)
      .click()

    cy.url().should('eq', `${Cypress.config().baseUrl}/posts`)
  })

  it('can add new posts', () => {
    cy.visit('/posts/new')

    cy.findByLabelText(/title/i)
      .type('Apple')
    cy.findByLabelText(/content/i)
      .type('Banana')
    cy.findByText(/create/i)
      .click()

    cy.findByText("Apple").should('exist')
  })
})
