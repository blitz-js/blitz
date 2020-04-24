describe('admin/products page', () => {
  beforeEach(() => {
    cy.visit('/admin/products')
  })

  it('Has H1', () => {
    cy.contains('h1', 'Products')
  })

  it('goes to new product page', () => {
    cy.get('p > a').first().contains('Create Product').click()
    cy.location('pathname').should('equal', '/admin/products/new')
  })

  it('goes to bas product page', () => {
    cy.get('p > a').last().contains('Admin').click()
    cy.location('pathname').should('equal', '/admin')
  })

  // TODO: Add tests for items
})

const fields = [
  {label: 'Product Name', type: 'input|'},
  {label: 'Handle', type: 'input|'},
  {label: 'Description', type: 'textarea|'},
  {label: 'Price', type: 'input|'}, // TODO: Add input type here input|number
]
const data = ['Apples', 'apples', 'Fresh apples', '32']

describe('admin/products/new page', () => {
  beforeEach(() => {
    cy.visit('/admin/products/new')
  })

  it('Has h1 and link back', () => {
    cy.contains('h1', 'Create a New Product')
    cy.get('p > a').first().contains('Manage Products').click()
    cy.location('pathname').should('equal', '/admin/products')
  })

  it('Has all fields and labels', () => {
    cy.get('form > div > label').as('inputs')
    cy.get('@inputs').should('have.length', 4)

    const count = {}
    for (let i = 0; i < data.length; i++) {
      const {type, label} = fields[i]
      const [element, inputType] = type.split('|')

      if (count[element] === undefined) count[element] = 0

      cy.get('@inputs').eq(i).contains(label)

      if (inputType) {
        cy.get('@inputs').get(element).eq(count[element]).should('have.attr', 'type', inputType)
      }

      count[element]++
    }
  })

  it('Fills fields', () => {
    cy.get('form > div > label').as('inputs')
    cy.get('@inputs').should('have.length', 4)

    const count = {}
    for (let i = 0; i < data.length; i++) {
      const [element] = fields[i].type.split('|')
      const item = data[i]

      if (count[element] === undefined) count[element] = 0

      cy.get('@inputs').eq(i).type(item)
      cy.get('@inputs').get(element).eq(count[element]).should('have.value', item)

      count[element]++
    }
  })
})

export {}
