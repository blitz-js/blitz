import {parsePublicDataToken, TOKEN_SEPARATOR} from "./supertokens"
import {setMilliseconds} from "date-fns"
describe("supertokens", () => {
  describe("parsePublicDataToken", () => {
    // sets milliseconds to zero because of precision loss between strings and Dates
    // const d = new Date()
    // d != new Date(atob(btoa(d)))
    const date = setMilliseconds(new Date(), 0)
    it("throws if token is empty", () => {
      const ret = () => parsePublicDataToken("")
      expect(ret).toThrow("[parsePublicDataToken] Failed: token is empty")
    })

    it("throws if the token cannot be parsed", () => {
      const invalidJSON = "{"
      const ret = () => parsePublicDataToken(btoa(invalidJSON))

      expect(ret).toThrowError("[parsePublicDataToken] Failed to parse publicDataStr: {")
    })

    it("parses the public data", () => {
      const validJSON = '"foo"'
      expect(parsePublicDataToken(btoa(validJSON))).toEqual({
        publicData: "foo",
      })
    })

    it("returns no expireAt value if not set", () => {
      const data = `"foo"${TOKEN_SEPARATOR}`
      expect(parsePublicDataToken(btoa(data))).toEqual({
        publicData: "foo",
      })
    })

    it("parses the expireAt date", () => {
      const data = `"foo"${TOKEN_SEPARATOR}${date}`
      expect(parsePublicDataToken(btoa(data))).toEqual({
        publicData: "foo",
        expireAt: date,
      })
    })

    it("only uses the first two separated tokens", () => {
      const data = `"foo"${TOKEN_SEPARATOR}${date}${TOKEN_SEPARATOR}123`
      expect(parsePublicDataToken(btoa(data))).toEqual({
        publicData: "foo",
        expireAt: date,
      })
    })
  })
})
