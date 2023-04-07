import {FieldValuesBuilder} from "../../../src/generators/template-builders/field-values-builder"
import {describe, it, expect} from "vitest"

describe("Form Generator", () => {
  process.env.BLITZ_APP_DIR = process.cwd()
  const generator = new FieldValuesBuilder()

  it("Should work with two word field names", async () => {
    expect(
      await generator.getFieldTemplateValues(["orgName:string", "orgId:integer"]),
    ).toStrictEqual([
      {
        component: "LabeledTextField",
        FieldName: "OrgName",
        Field_Name: "Org Name",
        Field_name: "Org name",
        attributeName: "orgName",
        fieldName: "orgName",
        field_name: "org name",
        zodType: "string",
        prismaType: "String",
        inputType: "text",
      },
      {
        component: "LabeledTextField",
        FieldName: "OrgId",
        Field_Name: "Org Id",
        Field_name: "Org id",
        attributeName: "orgId",
        fieldName: "orgId",
        field_name: "org id",
        zodType: "string",
        prismaType: "String",
        inputType: "text",
      },
    ])
  })
  it("Should work with simple types", async () => {
    expect(
      await generator.getFieldTemplateValues(["field1:string", "field2:string"]),
    ).toStrictEqual([
      {
        component: "LabeledTextField",
        FieldName: "Field1",
        Field_Name: "Field1",
        Field_name: "Field1",
        attributeName: "field1",
        fieldName: "field1",
        field_name: "field1",
        zodType: "string",
        prismaType: "String",
        inputType: "text",
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
        prismaType: "String",
        inputType: "text",
      },
    ])
  })

  it("Should work with optional types", async () => {
    expect(
      await generator.getFieldTemplateValues(["field1:string?", "field2:number"]),
    ).toStrictEqual([
      {
        component: "LabeledTextField",
        FieldName: "Field1",
        Field_Name: "Field1",
        Field_name: "Field1",
        attributeName: "field1",
        fieldName: "field1",
        field_name: "field1",
        zodType: "string",
        prismaType: "String",
        inputType: "text",
      },
      {
        component: "LabeledTextField",
        FieldName: "Field2",
        Field_Name: "Field2",
        Field_name: "Field2",
        attributeName: "field2",
        fieldName: "field2",
        field_name: "field2",
        zodType: "number",
        prismaType: "Int",
        inputType: "number",
      },
    ])
  })

  it("Should work with default values", async () => {
    expect(await generator.getFieldTemplateValues(["field1:string:default=test"])).toStrictEqual([
      {
        component: "LabeledTextField",
        FieldName: "Field1",
        Field_Name: "Field1",
        Field_name: "Field1",
        attributeName: "field1",
        fieldName: "field1",
        field_name: "field1",
        zodType: "string",
        prismaType: "String",
        inputType: "text",
      },
    ])
  })

  it("Should work with different input types", async () => {
    const fields = [
      "field1:string?",
      "field2:boolean",
      "field3:int",
      "field4:number",
      "field5:bigint?",
      "field6:float",
      "field7:decimal",
      "field8:datetime",
      "field9:uuid",
      "field10:json?",
    ]
    expect(await generator.getFieldTemplateValues(fields)).toStrictEqual([
      {
        component: "LabeledTextField",
        FieldName: "Field1",
        Field_Name: "Field1",
        Field_name: "Field1",
        attributeName: "field1",
        fieldName: "field1",
        field_name: "field1",
        zodType: "string",
        prismaType: "String",
        inputType: "text",
      },
      {
        component: "LabeledTextField",
        FieldName: "Field2",
        Field_Name: "Field2",
        Field_name: "Field2",
        attributeName: "field2",
        fieldName: "field2",
        field_name: "field2",
        zodType: "boolean",
        prismaType: "Boolean",
        inputType: "text",
      },
      {
        component: "LabeledTextField",
        FieldName: "Field3",
        Field_Name: "Field3",
        Field_name: "Field3",
        attributeName: "field3",
        fieldName: "field3",
        field_name: "field3",
        zodType: "number",
        prismaType: "Int",
        inputType: "number",
      },
      {
        component: "LabeledTextField",
        FieldName: "Field4",
        Field_Name: "Field4",
        Field_name: "Field4",
        attributeName: "field4",
        fieldName: "field4",
        field_name: "field4",
        zodType: "number",
        prismaType: "Int",
        inputType: "number",
      },
      {
        component: "LabeledTextField",
        FieldName: "Field5",
        Field_Name: "Field5",
        Field_name: "Field5",
        attributeName: "field5",
        fieldName: "field5",
        field_name: "field5",
        zodType: "number",
        prismaType: "BigInt",
        inputType: "number",
      },
      {
        component: "LabeledTextField",
        FieldName: "Field6",
        Field_Name: "Field6",
        Field_name: "Field6",
        attributeName: "field6",
        fieldName: "field6",
        field_name: "field6",
        zodType: "number",
        prismaType: "Float",
        inputType: "number",
      },
      {
        component: "LabeledTextField",
        FieldName: "Field7",
        Field_Name: "Field7",
        Field_name: "Field7",
        attributeName: "field7",
        fieldName: "field7",
        field_name: "field7",
        zodType: "number",
        prismaType: "Decimal",
        inputType: "number",
      },
      {
        component: "LabeledTextField",
        FieldName: "Field8",
        Field_Name: "Field8",
        Field_name: "Field8",
        attributeName: "field8",
        fieldName: "field8",
        field_name: "field8",
        zodType: "string().datetime()",
        prismaType: "DateTime",
        inputType: "text",
      },
      {
        component: "LabeledTextField",
        FieldName: "Field9",
        Field_Name: "Field9",
        Field_name: "Field9",
        attributeName: "field9",
        fieldName: "field9",
        field_name: "field9",
        zodType: "string().uuid",
        prismaType: "String",
        inputType: "text",
        default: "uuid",
      },
      {
        component: "LabeledTextField",
        FieldName: "Field10",
        Field_Name: "Field10",
        Field_name: "Field10",
        attributeName: "field10",
        fieldName: "field10",
        field_name: "field10",
        zodType: "any",
        prismaType: "Json",
        inputType: "text",
      },
    ])
  })
})
