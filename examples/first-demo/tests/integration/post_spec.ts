describe('The Post Page', () => {
  beforeEach(() => {
    cy.task('db:clear')
    cy.task('db:posts:add', {title: 'Apple', content: 'Banana'})
      .as('post')
  })

  it('successfuly loads', function() {
    const {id} = this.post
    cy.visit(`/posts/${id}`)

    cy.findByText('Apple').should('exist')
    cy.findByText('Banana').should('exist')
  })

  it('links back to posts page', function() {
    const {id} = this.post
    cy.visit(`/posts/${id}`)

    cy.findByText(/back to posts/i)
      .click()

    cy.url().should('eq', `${Cypress.config().baseUrl}/posts`)
  })

  it('links to post edit page', function() {
    const {id} = this.post
    cy.visit(`/posts/${id}`)

    cy.findByText(/edit/i)
      .click()

    cy.url().should('eq', `${Cypress.config().baseUrl}/posts/${id}/edit`)
  })

  it('can add comments', function() {
    const {id} = this.post
    cy.visit(`/posts/${id}`)

    cy.findByLabelText(/new comment/i)
      .type('Strawberry')
    cy.findByText(/^comment$/i)
      .click()

    cy.findByText('Strawberry').should('exist')
  })

  it('can delete a post', function() {
    const {id} = this.post
    cy.visit(`/posts/${id}`)

    cy.findAllByText(/delete/i)
      .first()
      .click()

    cy.url().should('eq', `${Cypress.config().baseUrl}/posts`)
    cy.findByText('Apple').should('not.exist')
  })

  it('can delete a comment', function() {
    cy.task('db:comments:add', {post: this.post, content: 'Awesome!'})

    const {id} = this.post
    cy.visit(`/posts/${id}`)

    cy.findAllByText(/delete/i)
      .last()
      .click()

    cy.findByText('Awesome!').should('not.exist')
  })
})
