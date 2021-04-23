import {addPrismaModelAttribute} from "@blitzjs/installer"

describe("addPrismaModelAttribute", () => {
  const subject = (source: string) =>
    addPrismaModelAttribute(source, "Project", {
      type: "attribute",
      kind: "model",
      name: "index",
      args: [
        {
          type: "attributeArgument",
          value: {
            type: "array",
            args: ["name"],
          },
        },
      ],
    })

  it("creates index", async () => {
    const source = `
datasource db {
  provider = "sqlite"
  url      = "file:./db.sqlite"
}

model Project {
  id        Int       @id @default(autoincrement())
  name      String    @unique
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
