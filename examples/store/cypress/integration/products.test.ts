describe('index page', () => {
  beforeEach(() => {
    cy.visit('/products')
  })

  // index
  it('Has H1', () => {
    cy.contains('h1', 'Products')
  })

  // [handle]
  it('goes to product page', () => {
    cy.get('#products > p > a').first().click()
    cy.location('pathname').should('match', /\/products\/\S+$/)
  })

  it('has price and title', () => {
    cy.get('#products > p > a').first().click()
    cy.location('pathname').should('match', /\/products\/\S+$/)

    cy.get('p').should('have.length', 2)
    cy.get('p')
      .last()
      .contains(/Price: \$[0-9]*/)

    cy.get('h1').should('have.length', 1)
  })

  it('goes to back to products page', () => {
    cy.get('#products > p > a').first().click()
    cy.location('pathname').should('match', /\/products\/\S+$/)

    cy.get('a').click()
    cy.location('pathname').should('equal', '/products')
  })
})

export {}
