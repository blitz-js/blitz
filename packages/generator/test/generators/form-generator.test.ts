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

  it("matches template comments correctly", () => {
    const regex = generator.fieldTemplateRegExp
    const curlyBraceComment1 = `{/* template: <__FieldComponent__ name="__fieldName__" label="__Field_Name__" placeholder="__Field_Name__" /> */}`
    const normalComment1 = `// template: __fieldName__: z.__zodTypeName__(),`
    expect(curlyBraceComment1.match(regex)?.[0].replace(regex, "$2$3")).toBe(`<__FieldComponent__ name="__fieldName__" label="__Field_Name__" placeholder="__Field_Name__" />`)
    expect(curlyBraceComment1.match(regex)?.[0].replace(regex, "$2$3")).not.toBe(`something Random`)

    expect(normalComment1.match(regex)?.[0].replace(regex, "$2$3")).toBe(`__fieldName__: z.__zodTypeName__(),`)
    expect(normalComment1.match(regex)?.[0].replace(regex, "$2$3")).not.toBe(`something Random`)

    const commentWithSpacing = `//     template: __fieldName__: z.__zodTypeName__(),`
    const commentWithNoSpacing = `//template: __fieldName__: z.__zodTypeName__(),`

    expect(commentWithSpacing.match(regex)?.[0].replace(regex, "$2$3")).toBe(`__fieldName__: z.__zodTypeName__(),`)
    expect(commentWithNoSpacing.match(regex)?.[0].replace(regex, "$2$3")).not.toBe(`__fieldName__: z.__zodTypeName__()`)
  })
})
