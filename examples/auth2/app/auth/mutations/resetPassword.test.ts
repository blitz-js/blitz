import resetPassword from "./resetPassword"
import db from "db"
import { hash256 } from "blitz"

beforeEach(async () => {
  //@ts-ignore
  await db.$reset()
})

const mockCtx: any = {
  session: {
    create: jest.fn,
  },
}

describe("resetPassword mutation", () => {
  it("works correctly", async () => {
    expect(true).toBe(true)

    // Create test user
    const goodToken = "randomPasswordResetToken"
    const expiredToken = "expiredRandomPasswordResetToken"
    const future = new Date()
    future.setHours(future.getHours() + 4)
    const past = new Date()
    past.setHours(past.getHours() - 4)

    const user = await db.user.create({
      data: {
        email: "user@example.com",
        tokens: {
          // Create old token to ensure it's deleted
          create: [
            {
              type: "RESET_PASSWORD",
              hashedToken: hash256(expiredToken),
              expiresAt: past,
              sentTo: "user@example.com",
            },
            {
              type: "RESET_PASSWORD",
              hashedToken: hash256(goodToken),
              expiresAt: future,
              sentTo: "user@example.com",
            },
          ],
        },
      },
      include: { tokens: true },
    })

    // Non-existent token
    await expect(
      resetPassword({ token: "no-token", password: "", passwordConfirmation: "" }, mockCtx)
    ).rejects.toThrowError()

    // Expired token
    await expect(
      resetPassword(
        { token: expiredToken, password: "newPassword", passwordConfirmation: "newPassword" },
        mockCtx
      )
    ).rejects.toThrowError()

    // Good token
    await resetPassword(
      { token: goodToken, password: "newPassword", passwordConfirmation: "newPassword" },
      mockCtx
    )

    // TODO finish here

    // const tokens = await db.token.findMany({ where: { userId: user.id } })
    // // delete's existing tokens
    // expect(tokens.length).toBe(1)
    // const token = tokens[0]
    //
    // expect(token.id).not.toBe(user.tokens[0].id)
    // expect(token.type).toBe("RESET_PASSWORD")
    // expect(token.sentTo).toBe(user.email)
    // // Ensure token is hashed
    // expect(token.hashedToken).not.toBe(generatedToken)
    // // Ensure expires in the future
    // expect(token.expiresAt > new Date()).toBe(true)
    // expect(previewEmail).toBeCalled()
  })
})
