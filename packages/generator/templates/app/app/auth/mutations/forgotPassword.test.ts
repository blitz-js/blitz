import { hash256, Ctx } from "blitz"
import forgotPassword from "./forgotPassword"
import db from "db"
import previewEmail from "preview-email"

beforeEach(async () => {
  await db.$reset()
})

const generatedToken = "plain-token"
jest.mock("blitz", () => ({
  ...jest.requireActual<object>("blitz")!,
  generateToken: () => generatedToken,
}))
jest.mock("preview-email", () => jest.fn())

describe("forgotPassword mutation", () => {
  it("does not throw error if user doesn't exist", async () => {
    await expect(forgotPassword({ email: "no-user@email.com" }, {} as Ctx)).resolves.not.toThrow()
  })

  it("works correctly", async () => {
    // Create test user
    const user = await db.user.create({
      data: {
        email: "user@example.com",
        tokens: {
          // Create old token to ensure it's deleted
          create: {
            type: "RESET_PASSWORD",
            hashedToken: "token",
            expiresAt: new Date(),
            sentTo: "user@example.com",
          },
        },
      },
      include: { tokens: true },
    })

    // Invoke the mutation
    await forgotPassword({ email: user.email }, {} as Ctx)

    const tokens = await db.token.findMany({ where: { userId: user.id } })
    const token = tokens[0]

    // delete's existing tokens
    expect(tokens.length).toBe(1)

    expect(token.id).not.toBe(user.tokens[0].id)
    expect(token.type).toBe("RESET_PASSWORD")
    expect(token.sentTo).toBe(user.email)
    expect(token.hashedToken).toBe(hash256(generatedToken))
    expect(token.expiresAt > new Date()).toBe(true)
    expect(previewEmail).toBeCalled()
  })
})
