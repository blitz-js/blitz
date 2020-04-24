describe('index page', () => {
  it('Has title and H1', () => {
    cy.visit('/')
    cy.contains('h1', 'Blitz Store Example')
    cy.title.should('eq', 'Blitz Example Store')
  })

  it('goes to products page', () => {
    cy.visit('/')
    cy.contains('a', 'View Static Public Product Listings').click()
    cy.location('pathname').should('equal', '/products')
  })

  it('goes to admin page', () => {
    cy.visit('/')
    cy.contains('a', 'View Dynamic Admin Section').click()
    cy.location('pathname').should('equal', '/admin')
  })
})

export {}
