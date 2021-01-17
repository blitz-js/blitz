import {
  capitalize,
  plural,
  pluralCamel,
  pluralPascal,
  singleCamel,
  singlePascal,
  singular,
  uncapitalize,
} from "../../src/utils/plurals"

describe("plurals utility function", () => {
  describe("works only first char", () => {
    it("capitalize", () => {
      expect(capitalize("blitz-js")).toBe("Blitz-js")
      expect(capitalize("Blitz-js")).toBe("Blitz-js")
      expect(capitalize("foo")).toBe("Foo")
      expect(capitalize("Bar")).toBe("Bar")
      expect(capitalize("multi-separated-string")).toBe("Multi-separated-string")
      expect(capitalize("Multi-separated-string")).toBe("Multi-separated-string")
    })
    it("uncapitalize", () => {
      expect(uncapitalize("Blitz-js")).toBe("blitz-js")
      expect(uncapitalize("blitz-js")).toBe("blitz-js")
      expect(uncapitalize("foo")).toBe("foo")
      expect(uncapitalize("Bar")).toBe("bar")
      expect(uncapitalize("multi-separated-string")).toBe("multi-separated-string")
      expect(uncapitalize("Multi-separated-string")).toBe("multi-separated-string")
    })
  })

  describe("singular", () => {
    it("singulars", () => {
      expect(singular("foo")).toBe("foo")
      expect(singular("bar")).toBe("bar")
    })
    it("plurals", () => {
      expect(singular("blitz-js")).toBe("blitz-j")
      expect(singular("suffix001s")).toBe("suffix001")
      expect(singular("suffix001S")).toBe("suffix001")
    })
    it("others", () => {
      expect(singleCamel("")).toBe("")
      expect(singleCamel("s")).toBe("")
      expect(singular("002")).toBe("002")
      expect(singular("Css")).toBe("Css")
      expect(singular("suffix001")).toBe("suffix001")
      expect(singular("suffix001-")).toBe("suffix001-")
    })
  })

  describe("plural", () => {
    it("singulars", () => {
      expect(plural("foo")).toBe("foos")
      expect(plural("bar")).toBe("bars")
    })
    it("plurals", () => {
      expect(plural("foobars")).toBe("foobars")
      expect(plural("blitz-js")).toBe("blitz-js")
      expect(plural("multi-single-words")).toBe("multi-single-words")
    })
    it("others", () => {
      expect(plural("")).toBe("")
      expect(plural("s")).toBe("s")
      expect(plural("002")).toBe("002s")
      expect(plural("css")).toBe("csses")
      expect(plural("suffix001")).toBe("suffix001s")
      expect(plural("suffix001-")).toBe("suffix001-s")
    })
  })

  describe("singleCamel", () => {
    it("capitals", () => {
      expect(singleCamel("Foo")).toBe("foo")
      expect(singleCamel("Bar")).toBe("bar")
    })
    it("plural", () => {
      expect(singleCamel("Foobars")).toBe("foobar")
      expect(singleCamel("Blitz-js")).toBe("blitz-j")
      expect(singleCamel("Multi-single-words")).toBe("multi-single-word")
    })
    it("others", () => {
      expect(singleCamel("")).toBe("")
      expect(singleCamel("s")).toBe("")
      expect(singleCamel("css")).toBe("css")
      expect(singleCamel("002")).toBe("002")
      expect(singleCamel("suffix001")).toBe("suffix001")
      expect(singleCamel("suffix001-")).toBe("suffix001-")
    })
  })

  describe("singlePascal", () => {
    it("uncapitals", () => {
      expect(singlePascal("foo")).toBe("Foo")
      expect(singlePascal("bar")).toBe("Bar")
    })
    it("plurals", () => {
      expect(singlePascal("foobars")).toBe("Foobar")
      expect(singlePascal("blitz-js")).toBe("Blitz-j")
      expect(singlePascal("multi-single-words")).toBe("Multi-single-word")
    })
    it("others", () => {
      expect(singlePascal("")).toBe("")
      expect(singlePascal("s")).toBe("")
      expect(singlePascal("css")).toBe("Css")
      expect(singlePascal("002")).toBe("002")
      expect(singlePascal("suffix001")).toBe("Suffix001")
      expect(singlePascal("suffix001-")).toBe("Suffix001-")
    })
  })

  describe("pluralCamel", () => {
    it("uncapitals", () => {
      expect(pluralCamel("foo")).toBe("foos")
      expect(pluralCamel("bar")).toBe("bars")
    })
    it("plurals", () => {
      expect(pluralCamel("foobars")).toBe("foobars")
      expect(pluralCamel("blitz-js")).toBe("blitz-js")
      expect(pluralCamel("multi-single-words")).toBe("multi-single-words")
    })
    it("others", () => {
      expect(pluralCamel("")).toBe("")
      expect(pluralCamel("s")).toBe("s")
      expect(pluralCamel("css")).toBe("csses")
      expect(pluralCamel("002")).toBe("002s")
      expect(pluralCamel("suffix001")).toBe("suffix001s")
      expect(pluralCamel("suffix001-")).toBe("suffix001-s")
    })
  })

  describe("pluralPascal", () => {
    it("uncapitals", () => {
      expect(pluralPascal("foo")).toBe("Foos")
      expect(pluralPascal("bar")).toBe("Bars")
    })
    it("plurals", () => {
      expect(pluralPascal("foobars")).toBe("Foobars")
      expect(pluralPascal("blitz-js")).toBe("Blitz-js")
      expect(pluralPascal("multi-single-words")).toBe("Multi-single-words")
    })
    it("others", () => {
      expect(pluralPascal("")).toBe("")
      expect(pluralPascal("s")).toBe("S")
      expect(pluralPascal("css")).toBe("Csses")
      expect(pluralPascal("002")).toBe("002s")
      expect(pluralPascal("suffix001")).toBe("Suffix001s")
      expect(pluralPascal("suffix001-")).toBe("Suffix001-s")
    })
  })
})
