import {PageGenerator} from "../../src/generators/page-generator"

describe("PageGenerator", () => {
  const generator = new PageGenerator({
    ModelName: "project",
    ModelNames: "projects",
    modelName: "project",
    modelNames: "projects",
  })

  describe("#getModelNamesPath", () => {
    it("returns path only with default modelNames", () => {
      expect(generator.getModelNamesPath()).toEqual("projects")
    })

    describe("when generator has context option", () => {
      const generator = new PageGenerator({
        ModelName: "project",
        ModelNames: "projects",
        modelName: "project",
        modelNames: "projects",
        context: "marketing",
      })

      it("returns path with context as prefix", () => {
        expect(generator.getModelNamesPath()).toEqual("marketing/projects")
      })
    })
  })

  describe("#getTemplateValues", () => {
    it("returns object with correct template values", async () => {
      const values = await generator.getTemplateValues()
      expect(values).toEqual({
        ModelName: "project",
        ModelNames: "projects",
        ParentModel: undefined,
        ParentModels: undefined,
        modelNamesPath: "projects",
        modelId: "projectId",
        modelIdParam: "[projectId]",
        modelName: "project",
        modelNames: "projects",
        parentModel: undefined,
        parentModelId: "",
        parentModelParam: "",
        parentModels: undefined,
      })
    })

    describe("when generator has context option", () => {
      const generator = new PageGenerator({
        ModelName: "project",
        ModelNames: "projects",
        modelName: "project",
        modelNames: "projects",
        context: "marketing",
      })

      it("returns path with context as prefix", async () => {
        const values = await generator.getTemplateValues()
        expect(values).toEqual(
          expect.objectContaining({
            modelNamesPath: "marketing/projects",
          }),
        )
      })
    })

    describe("when generator has parent option", () => {
      const generator = new PageGenerator({
        ModelName: "project",
        ModelNames: "projects",
        modelName: "project",
        modelNames: "projects",
        context: "marketing",
        parentModel: "board",
        parentModels: "boards",
        ParentModel: "board",
        ParentModels: "boards",
      })

      it("returns path with context as prefix", async () => {
        const values = await generator.getTemplateValues()
        expect(values).toEqual(
          expect.objectContaining({
            parentModelId: "boardId",
            parentModelParam: "[boardId]",
            parentModel: "board",
            parentModels: "boards",
            ParentModel: "board",
            ParentModels: "boards",
          }),
        )
      })
    })
  })
})
