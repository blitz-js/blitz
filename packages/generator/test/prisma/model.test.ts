import {Field} from "../../src/prisma/field"
import {Model} from "../../src/prisma/model"

describe("Prisma Model", () => {
  it("generates a proper model", async () => {
    expect(
      new Model(
        "user",
        [
          await Field.parse("email:string:unique"),
          await Field.parse("updated:dateTime:updatedAt"),
          await Field.parse("recentLogins:dateTime[]"),
          await Field.parse("twoFactorEnabled:boolean"),
          await Field.parse("twoFactorMethod:string?"),
        ].flat(),
      ).toString(),
    ).toMatchSnapshot()
  })
})
