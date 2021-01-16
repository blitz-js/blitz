// import { resetTestDb } from "@blitzjs/testing"
import forgotPassword from "./forgotPassword"

describe("forgotPassword mutation", () => {
  it("does not throw error if user doesn't exist", async () => {
    // await resetTestDb()
    expect(() => forgotPassword({ email: "no-user@email.com" })).not.toThrow()
  })
})
