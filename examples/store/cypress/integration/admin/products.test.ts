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
  {label: 'Product Name', type: 'input|', uniq: true},
  {label: 'Handle', type: 'input|', uniq: true},
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

  it('Fills fields and creates product', () => {
    cy.get('form > div > label').as('inputs')
    cy.get('@inputs').should('have.length', 4)

    const random = Math.round(Math.random() * 100000).toString()

    const count = {}
    for (let i = 0; i < data.length; i++) {
      const {label, type, uniq} = fields[i]
      const [element, inputType] = type.split('|')
      let item = data[i]

      if (count[element] === undefined) count[element] = 0
      if (inputType) {
        cy.get('@inputs').get(element).eq(count[element]).should('have.attr', 'type', inputType)
      }

      if (uniq) {
        item += random
      }

      cy.get('@inputs').eq(i).contains(label)
      cy.get('@inputs').eq(i).type(item)
      cy.get('@inputs').get(element).eq(count[element]).should('have.value', item)

      count[element]++
    }

    cy.get('button').click()

    cy.location('pathname').should('equal', '/admin/products')
    cy.get('ul > li:last-child').contains(data[0] + random)
  })
})

describe('admin/products/[handle] page', () => {
  beforeEach(() => {
    cy.visit('/admin/products')
    cy.get('ul > li:last-child a').click()
  })

  it('Has h1 and link back', () => {
    cy.contains('h1', 'Edit Product')
    cy.get('p > a').first().contains('Manage Products').click()
    cy.location('pathname').should('equal', '/admin/products')
  })

  it('Has all fields, change ProductName', () => {
    cy.get('form > div > label').as('inputs')
    cy.get('@inputs').should('have.length', 4)

    const random = Math.round(Math.random() * 100000).toString()

    const count = {}
    for (let i = 0; i < data.length; i++) {
      const {label, type} = fields[i]
      const [element, inputType] = type.split('|')
      let item = data[i]

      if (count[element] === undefined) count[element] = 0
      if (inputType) {
        cy.get('@inputs').get(element).eq(count[element]).should('have.attr', 'type', inputType)
      }

      item += random

      cy.get('@inputs').eq(i).contains(label)
      cy.get('@inputs').get(element).eq(count[element]).clear().type(item)
      cy.get('@inputs').get(element).eq(count[element]).should('have.value', item)

      count[element]++
    }

    cy.get('button').click()

    cy.location('pathname').should('equal', '/admin/products')
    cy.get('ul > li:last-child').contains(data[0] + random)
  })
})

export {}
