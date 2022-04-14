import resetPassword from "./resetPassword"
import { prisma } from "db"
import { SecurePassword, hash256 } from "@blitzjs/auth"

beforeEach(async () => {
  await prisma.$reset()
})

const mockCtx: any = {
  session: {
    $create: jest.fn,
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

    const user = await prisma.user.create({
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

    const newPassword = "newPassword"

    // Non-existent token
    await expect(
      resetPassword({ token: "no-token", password: "", passwordConfirmation: "" }, mockCtx)
    ).rejects.toThrowError()

    // Expired token
    await expect(
      resetPassword(
        { token: expiredToken, password: newPassword, passwordConfirmation: newPassword },
        mockCtx
      )
    ).rejects.toThrowError()

    // Good token
    await resetPassword(
      { token: goodToken, password: newPassword, passwordConfirmation: newPassword },
      mockCtx
    )

    // Delete's the token
    const numberOfTokens = await prisma.token.count({ where: { userId: user.id } })
    expect(numberOfTokens).toBe(0)

    // Updates user's password
    const updatedUser = await prisma.user.findFirst({ where: { id: user.id } })
    expect(await SecurePassword.verify(updatedUser!.hashedPassword, newPassword)).toBe(
      SecurePassword.VALID
    )
  })
})
