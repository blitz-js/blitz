import {matchBetween} from "../../src/utils/match-between"

const model = `model User {
  id             Int       @default(autoincrement()) @id
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  name           String?
  email          String    @unique
  hashedPassword String?
  role           String    @default("user")
  sessions       Session[]
}

model Session {
  id                 Int       @default(autoincrement()) @id
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  expiresAt          DateTime?
  handle             String    @unique
  user               User?     @relation(fields: [userId], references: [id])
  userId             Int?
  hashedSessionToken String?
  antiCSRFToken      String?
  publicData         String?
  privateData        String?
}`

describe("gets string between start and end", () => {
  it("includes start and endpoint", () => {
    const expected = `model User {
  id             Int       @default(autoincrement()) @id
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  name           String?
  email          String    @unique
  hashedPassword String?
  role           String    @default("user")
  sessions       Session[]
}`

    const actual = matchBetween(model, "model User", "}")
    expect(actual).toBe(expected)
  })

  it("returns null if no match is found", () => {
    const actual = matchBetween(model, "model Project", "}")
    expect(actual).toBe(null)
  })
})
