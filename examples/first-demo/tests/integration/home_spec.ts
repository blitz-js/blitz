describe('The Home Page', () => {
  it('successfuly loads', () => {
    cy.visit('/')

    cy.findByText('First Ever Blitz ⚡️ Demo!').should('exist')
  })

  it('links to project GitHub', () => {
    cy.visit('/')

    cy.findByText(/view on github/i)
      .should('have.attr', 'href', 'https://github.com/blitz-js/blitz')
  })

  it('links to post page', () => {
    cy.visit('/')

    cy.findByText(/view posts/i)
      .click()

    cy.url().should('eq', `${Cypress.config().baseUrl}/posts`)
  })
})
