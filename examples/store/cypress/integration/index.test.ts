describe('index page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Has title and H1', () => {
    cy.contains('h1', 'Blitz Store Example')
    cy.title().should('eq', 'Blitz Example Store')
  })

  it('goes to products page', () => {
    cy.contains('a', 'View Static Public Product Listings').click()
    cy.location('pathname').should('equal', '/products')
  })

  it('goes to admin page', () => {
    cy.contains('a', 'View Dynamic Admin Section').click()
    cy.location('pathname').should('equal', '/admin')
  })
})

export {}
