import {addPrismaModel} from "@blitzjs/installer"

describe("addPrismaModel", () => {
  const subject = (source: string) =>
    addPrismaModel(source, {name: "Project", fields: [{name: "id", type: "Int", isId: true}]})

  it("creates model", async () => {
    const source = `
datasource db {
  provider = "sqlite"
  url      = "file:./db.sqlite"
}`.trim()

    expect(await subject(source)).toMatchSnapshot()
  })
})
