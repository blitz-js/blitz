describe('The Post Edit Page', () => {
  beforeEach(() => {
    cy.task('db:clear')
    cy.task('db:posts:add', {title: 'Apple', content: 'Banana'})
      .as('post')
  })

  it('successfuly loads', function() {
    const {id} = this.post
    cy.visit(`/posts/${id}/edit`)

    cy.findByText('Apple').should('exist')
  })

  it('links back to post page', function() {
    const {id} = this.post
    cy.visit(`/posts/${id}/edit`)

    cy.findByText(/cancel/i)
      .click()

    cy.url().should('eq', `${Cypress.config().baseUrl}/posts/${id}`)
  })

  it('can update post data', function() {
    const {id} = this.post
    cy.visit(`/posts/${id}/edit`)

    cy.findByLabelText(/title/i)
      .clear()
      .type('Strawberry')
    cy.findByLabelText(/content/i)
      .clear()
      .type('Blueberry')
    cy.findByText(/save/i)
      .click()

    cy.url().should('eq', `${Cypress.config().baseUrl}/posts/${id}`)
    cy.findByText('Strawberry').should('exist')
    cy.findByText('Blueberry').should('exist')
  })
})
