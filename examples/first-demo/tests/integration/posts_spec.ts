describe('The Posts Page', () => {
  it('successfuly loads', () => {
    cy.visit('/posts')

    cy.findByText(/first \d posts/i).should('exist')
  })

  it('links to home page', () => {
    cy.visit('/posts')

    cy.findByText(/home/i)
      .click()

    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
  })

  it('links to new post page', () => {
    cy.visit('/posts')

    cy.findByText(/new post/i)
      .click()

    cy.url().should('eq', `${Cypress.config().baseUrl}/posts/new`)
  })

  it('shows the number of added posts', () => {
    cy.task('db:clear')
    cy.task('db:posts:add', {title: 'Apple', content: 'Apple'})
    cy.task('db:posts:add', {title: 'Banana', content: 'Banana'})

    cy.visit('/posts')

    cy.findByText(/first 2 posts/i).should('exist')
  })
})
