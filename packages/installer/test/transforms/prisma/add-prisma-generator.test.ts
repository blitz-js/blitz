import {addPrismaGenerator} from "@blitzjs/installer"

describe("addPrismaGenerator", () => {
  const subject = (source: string) =>
    addPrismaGenerator(source, {
      type: "generator",
      name: "nexusPrisma",
      assignments: [{type: "assignment", key: "provider", value: '"nexus-prisma"'}],
    })

  it("adds generator and keeps existing generator", async () => {
    const source = `
datasource db {
  provider = "sqlite"
  url      = "file:./db.sqlite"
}

generator client {
  provider = "prisma-client-js"
}`.trim()

    expect(await subject(source)).toMatchSnapshot()
  })
  it("adds generator to file", async () => {
    const source = `
datasource db {
  provider = "sqlite"
  url      = "file:./db.sqlite"
}`.trim()

    expect(await subject(source)).toMatchSnapshot()
  })

  it("overwrites same generator", async () => {
    const source = `
datasource db {
  provider = "sqlite"
  url      = "file:./db.sqlite"
}

generator nexusPrisma {
  provider = "this-should-not-be-in-the-snapshot"
}`.trim()

    expect(await subject(source)).toMatchSnapshot()
  })
})
