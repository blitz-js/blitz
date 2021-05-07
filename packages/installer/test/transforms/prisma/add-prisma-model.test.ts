import {addPrismaModel} from "@blitzjs/installer"

describe("addPrismaModel", () => {
  const subject = (source: string) =>
    addPrismaModel(source, {
      type: "model",
      name: "Project",
      properties: [{type: "field", name: "id", fieldType: "String"}],
    })

  it("creates model", async () => {
    const source = `
datasource db {
  provider = "sqlite"
  url      = "file:./db.sqlite"
}`.trim()

    expect(await subject(source)).toMatchSnapshot()
  })
})
