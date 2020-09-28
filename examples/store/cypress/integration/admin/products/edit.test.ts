import {insert, data, fields} from "./helper"

describe("admin/products/[handle] page", () => {
  beforeEach(() => {
    insert()

    cy.visit("/admin/products")
    cy.get("ul > li:last-child a").click()
  })

  it("Has h1 and link back", () => {
    cy.contains("h1", "Edit Product")
    cy.get("p > a").first().contains("Manage Products").click()
    cy.location("pathname").should("equal", "/admin/products")
  })

  it("Has all fields, change ProductName", () => {
    cy.get("form > div > label").as("inputs")
    cy.get("@inputs").should("have.length", 4)

    const random = Math.round(Math.random() * 100000).toString()

    const count = {}
    for (let i = 0; i < data.length; i++) {
      const {label, type} = fields[i]
      const [element, inputType] = type.split("|")
      let item = data[i]

      if (count[element] === undefined) count[element] = 0
      if (inputType) {
        cy.get("@inputs").get(element).eq(count[element]).should("have.attr", "type", inputType)
      }

      item += random

      cy.get("@inputs").eq(i).contains(label)
      cy.get("@inputs").get(element).eq(count[element]).clear().type(item)
      cy.get("@inputs").get(element).eq(count[element]).should("have.value", item)

      count[element]++
    }

    cy.get("button").click()

    cy.location("pathname").should("equal", "/admin/products")
    cy.get("ul > li:last-child").contains(data[0] + random)
  })
})

export {}
