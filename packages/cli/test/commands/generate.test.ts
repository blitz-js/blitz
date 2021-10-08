import * as path from "path"
import {Generate} from "../../src/commands/generate"

describe("`generate` command", () => {
  describe("#getModelNameAndContext", () => {
    it("properly extracts context from arguments", () => {
      const getModelNameAndContext = Generate.prototype.getModelNameAndContext
      expect(getModelNameAndContext("admin/tasks")).toEqual({
        model: "tasks",
        context: "admin",
      })

      expect(getModelNameAndContext("admin/projects/tasks")).toEqual({
        model: "tasks",
        context: path.join("admin", "projects"),
      })

      // this should fail on windows if generic filesystem-specific code makes it in
      expect(getModelNameAndContext("admin\\projects\\tasks")).toEqual({
        model: "tasks",
        context: path.join("admin", "projects"),
      })
    })

    describe("when passing context", () => {
      it("returns both model and context in their own field", () => {
        const getModelNameAndContext = Generate.prototype.getModelNameAndContext
        expect(getModelNameAndContext("tasks", "admin")).toEqual({
          model: "tasks",
          context: "admin",
        })
      })

      it("returns context undefined if not set", () => {
        const getModelNameAndContext = Generate.prototype.getModelNameAndContext
        expect(getModelNameAndContext("tasks")).toEqual({
          model: "tasks",
          context: undefined,
        })
      })

      it("returns context undefined if empty string", () => {
        const getModelNameAndContext = Generate.prototype.getModelNameAndContext
        expect(getModelNameAndContext("tasks", "")).toEqual({
          model: "tasks",
          context: undefined,
        })
      })
    })
  })

  describe("#validateModelName", () => {
    describe("when model name is not reserved", () => {
      it("should do nothing", () => {
        const validateModelName = Generate.prototype.validateModelName
        expect(() => validateModelName("project")).not.toThrow()
      })
    })
    describe("when model name is reserved", () => {
      it('should throw an error for model "page"', () => {
        const getModelNameAndContext = Generate.prototype.validateModelName
        expect(() => getModelNameAndContext("page")).toThrowError(
          "Names page,api,query,mutation or their plurals cannot be used as model names",
        )
      })
      it('should throw an error for model "api"', () => {
        const getModelNameAndContext = Generate.prototype.validateModelName
        expect(() => getModelNameAndContext("api")).toThrowError(
          "Names page,api,query,mutation or their plurals cannot be used as model names",
        )
      })
      it('should throw an error for model "query"', () => {
        const getModelNameAndContext = Generate.prototype.validateModelName
        expect(() => getModelNameAndContext("query")).toThrowError(
          "Names page,api,query,mutation or their plurals cannot be used as model names",
        )
      })
      it('should throw an error for model "mutation"', () => {
        const getModelNameAndContext = Generate.prototype.validateModelName
        expect(() => getModelNameAndContext("mutation")).toThrowError(
          "Names page,api,query,mutation or their plurals cannot be used as model names",
        )
      })
    })
  })
})
