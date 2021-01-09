describe("products#index page", () => {
  it("Has H1", () => {
    cy.visit("/products")
    cy.contains("h1", "Products")
  })

  it("Logs the XKCD (Regression #1646)", () => {
    cy.visit("/products", {
      onBeforeLoad(win) {
        cy.stub(win.console, "log").as("consoleLog")
      },
    })
    cy.get("@consoleLog").should("be.calledWithMatch", /Attention! Must read: .*/)
  })
})

describe("products#show page", () => {
  beforeEach(() => {
    cy.visit("/products")
  })

  it("goes to product page", () => {
    cy.get("#products > p > a").first().click()
    cy.location("pathname").should("match", /\/products\/\S+$/)
  })

  it("has price and title", () => {
    cy.get("#products > p > a").first().click()
    cy.location("pathname").should("match", /\/products\/\S+$/)

    cy.get("p").should("have.length", 2)
    cy.get("p")
      .last()
      .contains(/Price: \$[0-9]*/)

    cy.get("h1").should("have.length", 1)
  })

  it("goes to back to products page", () => {
    cy.get("#products > p > a").first().click()
    cy.location("pathname").should("match", /\/products\/\S+$/)

    cy.get("a").first().click()
    cy.location("pathname").should("equal", "/products")
  })

  it("shows the average price", () => {
    cy.contains(/Average price: \d+.\d/)
  })
})

describe("products#ssr page", () => {
  beforeEach(() => {
    cy.visit("/products/ssr")
  })

  it("has title", () => {
    cy.get("h1").contains("Products")
  })

  it("goes to back to products page", () => {
    cy.get("#products > p > a").first().click()
    cy.location("pathname").should("not.match", /\/products\/ssr$/)

    cy.get("a").first().click()
    cy.location("pathname").should("equal", "/products")
  })
})

describe("products#infinite page", () => {
  beforeEach(() => {
    cy.visit("/products/infinite")
  })

  it("shows 3 products", () => {
    cy.get('[data-test="productName"]').should("have.length", 3)
  })
})

export {}
