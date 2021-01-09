import {SecurePassword} from "../src/auth-utils"

describe("SecurePassword", () => {
  describe("hash", () => {
    it("works", async () => {
      const result = await SecurePassword.hash("mypass")
      expect(typeof result).toBe("string")
    })

    it("throws on empty input", async () => {
      await expect(SecurePassword.hash(undefined)).rejects.toThrow()
      await expect(SecurePassword.hash(null)).rejects.toThrow()
      await expect(SecurePassword.hash("")).rejects.toThrow()
    })
  })

  describe("verify", () => {
    it("works", async () => {
      // don't have a test for a correct hash because the hash can change between
      // secure-password versions
      await expect(SecurePassword.verify("wronghash", "mypass")).rejects.toThrow()
    })

    it("throws on empty input", async () => {
      await expect(SecurePassword.verify(undefined, "pass")).rejects.toThrow()
      await expect(SecurePassword.verify("pass", undefined)).rejects.toThrow()
      await expect(SecurePassword.verify(null, null)).rejects.toThrow()
      await expect(SecurePassword.verify("", "")).rejects.toThrow()
    })
  })
})
