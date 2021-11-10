import { FieldValuesBuilder } from "../../src/generators/template-builders/field-values-builder"

describe("Form Generator", () => {
  const generator = new FieldValuesBuilder()
  
  it("Correctly builds extra args", async () => {
      expect(await generator.getFieldTemplateValues([
        "field1:string",
        "field2:string"
      ])).toBe({
        attributeName: "field1",
        zodType: "string",
        FieldComponent: "LabeledTextField",
        fieldName: "field1",
        FieldName: "Field1",
        field_name: "field1",
        Field_name: "Field1",
        Field_Name: "Field1",
      })
  })
})