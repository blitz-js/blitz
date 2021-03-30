import {addPrismaEnum} from "@blitzjs/installer"

describe("addPrismaEnum", () => {
  const subject = (source: string) =>
    addPrismaEnum(source, {name: "Role", values: ["USER", "ADMIN"]})

  it("creates enum", async () => {
    const source = `
datasource db {
  provider = "sqlite"
  url      = "file:./db.sqlite"
}`.trim()

    expect(await subject(source)).toMatchSnapshot()
  })
})
