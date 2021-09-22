import {addPrismaField} from "@blitzjs/installer"

describe("addPrismaField", () => {
  const subject = (source: string) =>
    addPrismaField(source, "Project", {
      type: "field",
      name: "name",
      fieldType: "String",
      optional: false,
      attributes: [{type: "attribute", kind: "field", name: "unique"}],
    })

  it("creates field", async () => {
    const source = `
datasource db {
  provider = "sqlite"
  url      = "file:./db.sqlite"
}

model Project {
  id        Int       @id @default(autoincrement())
}`.trim()

    expect(await subject(source)).toMatchSnapshot()
  })

  it("skips if model is missing", async () => {
    const source = `
datasource db {
  provider = "sqlite"
  url      = "file:./db.sqlite"
}`.trim()
    expect(await subject(source)).toMatchSnapshot()
  })
})
