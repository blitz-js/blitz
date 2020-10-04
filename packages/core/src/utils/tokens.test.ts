import {TOKEN_SEPARATOR} from "../constants"
import {parsePublicDataToken} from "./tokens"

describe("supertokens", () => {
  describe("parsePublicDataToken", () => {
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

    it("only uses the first separated tokens", () => {
      const data = `"foo"${TOKEN_SEPARATOR}123`
      expect(parsePublicDataToken(btoa(data))).toEqual({
        publicData: "foo",
      })
    })
  })
})
