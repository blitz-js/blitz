import {toBase64} from "b64-lite"
import {parsePublicDataToken} from "./public-data-token"

describe("parsePublicDataToken", () => {
  it("throws if token is empty", () => {
    const ret = () => parsePublicDataToken("")
    expect(ret).toThrow("[parsePublicDataToken] Failed: token is empty")
  })

  it("throws if the token cannot be parsed", () => {
    const invalidJSON = "{"
    const ret = () => parsePublicDataToken(toBase64(invalidJSON))

    expect(ret).toThrowError("[parsePublicDataToken] Failed to parse publicDataStr: {")
  })

  it("parses the public data", () => {
    const validJSON = '{"foo": "bar"}'
    expect(parsePublicDataToken(toBase64(validJSON))).toEqual({
      publicData: {foo: "bar"},
    })
  })

  it("parses the public data containing unicode chars", () => {
    const data = '"foo-κόσμε-żółć-平仮名"'
    expect(parsePublicDataToken(toBase64(data))).toEqual({
      publicData: "foo-κόσμε-żółć-平仮名",
    })
  })
})
