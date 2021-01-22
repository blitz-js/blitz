import {Field} from "../../src/prisma/field"
import {Model} from "../../src/prisma/model"

describe("Prisma Model", () => {
  it("generates a proper model", () => {
    expect(
      new Model(
        "user",
        [
          Field.parse("email:string:unique"),
          Field.parse("updated:dateTime:updatedAt"),
          Field.parse("recentLogins:dateTime[]"),
          Field.parse("twoFactorEnabled:boolean"),
          Field.parse("twoFactorMethod:string?"),
        ].flat(),
      ).toString(),
    ).toMatchSnapshot()
  })
})
