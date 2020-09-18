import {camelCaseToKebabCase} from "../../src/utils/kebab-case"

describe("kebabCase utility function", () => {
  describe("transform a camelCase string to kebab case", () => {
    it("works for 2 word camelCase", () => {
      const result = camelCaseToKebabCase("testResult")

      expect(result).toBe("test-result")
    })

    it("works for multiple camelCase words", () => {
      const result = camelCaseToKebabCase("longTestStringResult")

      expect(result).toBe("long-test-string-result")
    })
  })

  describe("do not transform strings that are not camelCase", () => {
    it("does not modify a kebabCase string", () => {
      const result = camelCaseToKebabCase("test-result")

      expect(result).toBe("test-result")
    })

    it("does not modify single word string", () => {
      const result = camelCaseToKebabCase("testresult")

      expect(result).toBe("testresult")
    })
  })
})
