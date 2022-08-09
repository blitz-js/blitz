export const fields = [
  {label: "Product Name", type: "input|", uniq: true},
  {label: "Handle", type: "input|", uniq: true},
  {label: "Description", type: "textarea|"},
  {label: "Price", type: "input|"}, // TODO: Add input type here input|number
]
export const data = ["Apples", "apples", "Fresh apples", "32"]

export const insert = (): string => {
  cy.visit("/admin/products/new")
  cy.get("form > div > label").as("inputs")
  cy.get("@inputs").should("have.length", 4)

  const random = Math.round(Math.random() * 100000).toString()
  const name = data[0] + random

  const count = {}
  for (let i = 0; i < data.length; i++) {
    const {label, type, uniq} = fields[i]
    const [element, inputType] = type.split("|")
    let item = data[i]

    if (count[element] === undefined) count[element] = 0
    if (inputType) {
      cy.get("@inputs").get(element).eq(count[element]).should("have.attr", "type", inputType)
    }

    if (uniq) {
      item += random
    }

    cy.get("@inputs").eq(i).contains(label)
    cy.get("@inputs").eq(i).type(item)
    cy.get("@inputs").get(element).eq(count[element]).should("have.value", item)

    count[element]++
  }

  cy.get("button").click()

  cy.location("pathname").should("equal", "/admin/products")
  cy.get("ul > li:first-child").contains(name)

  return name
}
