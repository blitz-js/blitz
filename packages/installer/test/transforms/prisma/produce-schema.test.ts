import {produceSchema} from "@blitzjs/installer"
import fs from "fs"
import path from "path"
import {promisify} from "util"
const readFile = promisify(fs.readFile)

describe("produceSchema", () => {
  const subject = (source: string) => produceSchema(source, () => {})

  let originalDatabaseUrl
  beforeAll(() => {
    originalDatabaseUrl = process.env.DATABASE_URL
    process.env.DATABASE_URL ||= "file:./db.sqlite"
  })

  afterAll(() => {
    process.env.DATABASE_URL = originalDatabaseUrl
  })

  const fixturesDir = path.resolve(__dirname, "./fixtures")
  fs.readdirSync(fixturesDir).forEach((file) => {
    it(`cleanly parses and serializes schema: [${file}]`, async () => {
      const source = await readFile(path.resolve(fixturesDir, file), {encoding: "utf-8"})
      expect(await subject(source)).toMatchInlineSnapshot(`
        "
        datasource DS {
          provider = \\"sqlite\\"
          url      = env(\\"DATABASE_URL\\")
        }

        generator client {
          provider = \\"prisma-client-js\\"
          binaryTargets = \\"native\\"
        }
        /// Define your own datamodels here and run \`yarn redwood db save\` to create
        /// migrations for them.

        model Post {
          /// this is the post id
          id       Int       @id @default(autoincrement())
          title    String
          slug     String    @unique
          author   String
          body     String
          image    String?
          tags     Tag[]
          postedAt DateTime?
        }

        model Tag {
          id    Int    @id @default(autoincrement())
          name  String @unique
          posts Post[]
        }

        model User {
          id      Int     @id @default(autoincrement())
          name    String?
          email   String  @unique
          isAdmin Boolean @default(false)
        }"
      `)
    })
  })
})
