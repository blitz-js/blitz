import {checkInputsOrRaise} from "../../../../generator/src/utils/checkInputOrRaise"
import {describe, expect, it} from "vitest"

describe("checkInputsOrRaise()", () => {
  describe("with input string", () => {
    it("does not raise when input string OK", () => {
      expect(() => checkInputsOrRaise("Foo:foo=bar[]?:-_ ")).not.toThrow()
    })
    it("raisees when input has unwanted characters", () => {
      expect(() => checkInputsOrRaise("()!")).toThrowError(
        "Input should only contain alphanumeric characters, spaces, and the following characters: - _ : = ? [ ]",
      )
    })
  })

  describe("with input string[]", () => {
    it("does not raise when input strings OK", () => {
      expect(() => checkInputsOrRaise(["ok:ok=ok", "also ok:ok"])).not.toThrow()
    })
    it("raisees when one input has unwanted characters", () => {
      expect(() => checkInputsOrRaise(["ok:ok=ok", "not ok!"])).toThrowError(
        "Input should only contain alphanumeric characters, spaces, and the following characters: - _ : = ? [ ]",
      )
    })
  })
})
