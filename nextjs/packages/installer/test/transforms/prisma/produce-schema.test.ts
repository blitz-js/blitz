import { produceSchema } from '@blitzjs/installer'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
const readFile = promisify(fs.readFile)

describe('produceSchema', () => {
  const subject = (source: string) => produceSchema(source, () => {})

  let originalDatabaseUrl
  beforeAll(() => {
    originalDatabaseUrl = process.env.DATABASE_URL
    process.env.DATABASE_URL ||= 'file:./db.sqlite'
  })

  afterAll(() => {
    process.env.DATABASE_URL = originalDatabaseUrl
  })

  const fixturesDir = path.resolve(__dirname, './fixtures')
  fs.readdirSync(fixturesDir).forEach((file) => {
    it(`cleanly parses and serializes schema: [${file}]`, async () => {
      const source = await readFile(path.resolve(fixturesDir, file), {
        encoding: 'utf-8',
      })
      expect(await subject(source)).toMatchSnapshot()
    })
  })
})
