import {FormGenerator} from "../../src/generators/form-generator"

describe("Form Generator", () => {
  const generator = new FormGenerator({
    ModelName: "project",
    ModelNames: "projects",
    modelName: "project",
    modelNames: "projects",
    extraArgs: ["myProjectName"],
  })

  it("Correctly generates field names", async () => {
    const templateValues = await generator.getTemplateValues()
    expect(templateValues.fieldTemplateValues[0].fieldName).toEqual("myProjectName")
    expect(templateValues.fieldTemplateValues[0].FieldName).toEqual("MyProjectName")
    expect(templateValues.fieldTemplateValues[0].field_name).toEqual("my project name")
    expect(templateValues.fieldTemplateValues[0].Field_name).toEqual("My project name")
    expect(templateValues.fieldTemplateValues[0].Field_Name).toEqual("My Project Name")
  })
})
