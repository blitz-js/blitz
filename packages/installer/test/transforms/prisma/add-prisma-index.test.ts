import {addPrismaIndex, PrismaIndex} from "@blitzjs/installer"

describe("addPrismaIndex", () => {
  const subject = (source: string, index: PrismaIndex) => addPrismaIndex(source, "Project", index)

  // TODO: @prisma/sdk doesn't parse indexes yet
  // https://github.com/prisma/prisma/issues/3998
  xit("creates index", async () => {
    const source = `
datasource db {
  provider = "sqlite"
  url      = "file:./db.sqlite"
}

model Project {
  id        Int       @id @default(autoincrement())
  name      String    @unique
}`.trim()

    expect(await subject(source, {name: "name_index", fields: ["name"]})).toMatchSnapshot()
  })

  it("skips if model is missing", async () => {
    const source = `
datasource db {
  provider = "sqlite"
  url      = "file:./db.sqlite"
}`.trim()
    expect(await subject(source, {name: "name_index", fields: ["name"]})).toMatchSnapshot()
  })
})
