import {setPrismaDataSource} from "@blitzjs/installer"

describe("setPrismaDataSource", () => {
  const subject = (source: string) =>
    setPrismaDataSource(source, {
      type: "datasource",
      name: "db",
      assignments: [
        {type: "assignment", key: "provider", value: '"postgresql"'},
        {
          type: "assignment",
          key: "url",
          value: {type: "function", name: "env", params: ['"DATABASE_URL"']},
        },
      ],
    })

  it("sets datasource", async () => {
    const source = `
// comment up here

datasource db {
  provider = "sqlite"
  url      = "file:./db.sqlite"
}

// comment down here`.trim()

    expect(await subject(source)).toMatchSnapshot()
  })

  it("adds datasource if missing", async () => {
    const source = `
// wow there is no datasource here
    `.trim()
    expect(await subject(source)).toMatchSnapshot()
  })
})
