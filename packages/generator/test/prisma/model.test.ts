import {describe, expect, it} from "vitest"
import {Field} from "../../src/prisma/field"
import {Model} from "../../src/prisma/model"

describe("Prisma Model", () => {
  it("generates a proper model", async () => {
    const email = await Field.parse("email:string:unique")
    const updated = await Field.parse("updated:dateTime:updatedAt")
    const recentLogins = await Field.parse("recentLogins:dateTime[]")
    const twoFactorEnabled = await Field.parse("twoFactorEnabled:boolean")
    const twoFactorMethod = await Field.parse("twoFactorMethod:string?")
    const fields = [email, updated, recentLogins, twoFactorEnabled, twoFactorMethod].flat()
    expect(new Model("user", fields).toString()).toMatchSnapshot()
  })
})
