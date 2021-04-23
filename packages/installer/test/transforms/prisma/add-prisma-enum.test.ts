import {addPrismaEnum} from "@blitzjs/installer"

describe("addPrismaEnum", () => {
  const subject = (source: string) =>
    addPrismaEnum(source, {
      type: "enum",
      name: "Role",
      enumerators: [
        {type: "enumerator", name: "USER"},
        {type: "enumerator", name: "ADMIN"},
      ],
    })

  it("creates enum", async () => {
    const source = `
datasource db {
  provider = "sqlite"
  url      = "file:./db.sqlite"
}`.trim()

    expect(await subject(source)).toMatchSnapshot()
  })
})
