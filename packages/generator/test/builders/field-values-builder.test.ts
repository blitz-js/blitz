import {FieldValuesBuilder} from "../../src/generators/template-builders/field-values-builder"

describe("Form Generator", () => {
  const generator = new FieldValuesBuilder()

  it("Correctly builds extra args", async () => {
    expect(await generator.getFieldTemplateValues(["field1:string", "field2:string"])).toBe([
      {
        component: "LabeledTextField",
        FieldName: "Field1",
        Field_Name: "Field1",
        Field_name: "Field1",
        attributeName: "field1",
        fieldName: "field1",
        field_name: "field1",
        zodType: "string",
        inputType: "text"
      },
      {
        component: "LabeledTextField",
        FieldName: "Field2",
        Field_Name: "Field2",
        Field_name: "Field2",
        attributeName: "field2",
        fieldName: "field2",
        field_name: "field2",
        zodType: "string",
        inputType: "text"
      },
    ])
  })
})
