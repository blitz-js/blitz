import { FieldValuesBuilder } from "../../src/generators/template-builders/field-values-builder"

describe("Form Generator", () => {
  const generator = new FieldValuesBuilder()
  
  it("Correctly builds extra args", async () => {
      expect(generator.getFieldTemplateValues([
        "field1:string",
        "field2:string"
      ]))
  })
})