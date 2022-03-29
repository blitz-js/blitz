import {describe, it, expect} from "vitest"
import {Schema} from "@mrleebo/prisma-ast"
import {Field} from "../../src/prisma/field"

describe("Field", () => {
  it("parses optional types", () => {
    const [field] = Field.parse("name:string?")
    expect(field?.isRequired).toBe(false)
  })

  it("appends unique attribute", () => {
    const [field] = Field.parse("email:string?:unique")
    expect(field?.isUnique).toBe(true)
  })

  it("appends updatedAt attribute", () => {
    const [field] = Field.parse("updatedAt:DateTime:updatedAt")
    expect(field?.isUpdatedAt).toBe(true)
  })

  it("handles default simple attribute", () => {
    const [field] = Field.parse("isActive:boolean:default=true")
    expect(field?.default).toBe("true")
  })

  it("handles default uuid attribute", () => {
    const [field] = Field.parse("id:string:default=uuid")
    expect(field?.default).toMatchObject({name: "uuid"})
  })

  it("handles uuid convenience syntax", () => {
    const [field] = Field.parse("someSpecialToken:uuid")
    expect(field?.type).toBe("String")
    expect(field?.default).toMatchObject({name: "uuid"})
  })

  it("handles default autoincrement attribute", () => {
    const [field] = Field.parse("id:int:default=autoincrement")
    expect(field?.default).toMatchObject({name: "autoincrement"})
  })

  it("has default field type", () => {
    const [field] = Field.parse("name")
    expect(field?.type).toBe("String")
  })

  it("allow number characters in model name", () => {
    const [field] = Field.parse("name2")
    expect(field?.name).toBe("name2")
  })

  it("allow underscore characters in model name", () => {
    const [field] = Field.parse("first_name")
    expect(field?.name).toBe("first_name")
  })

  it("disallows number as a first character in model name", () => {
    expect(() => Field.parse("2first")).toThrow()
  })

  it("disallows underscore as a first character in model name", () => {
    expect(() => Field.parse("_first")).toThrow()
  })

  it("disallows special characters in model name", () => {
    expect(() => Field.parse("app-user:int")).toThrow()
  })

  it("disallows optional list fields", () => {
    expect(() => Field.parse("users:int?[]")).toThrow()
  })

  it("requires a name", () => {
    expect(() => Field.parse(":int")).toThrow()
  })

  describe("belongsTo", () => {
    const schema: Schema = {
      type: "schema",
      list: [
        {
          type: "model",
          name: "Task",
          properties: [
            {
              type: "field",
              name: "id",
              fieldType: "Int",
            },
          ],
        },
        {
          type: "model",
          name: "Project",
          properties: [
            {
              type: "field",
              name: "id",
              fieldType: "String",
            },
          ],
        },
      ],
    }

    it("simple relation", () => {
      const [relation, foreignKey] = Field.parse("belongsTo:task")
      expect(relation).toMatchObject({
        name: "task",
        type: "Task",
        relationFromFields: ["taskId"],
        relationToFields: ["id"],
      })
      expect(foreignKey).toMatchObject({name: "taskId", type: "Int"})
    })

    it("relation with schema", () => {
      const [relation, foreignKey] = Field.parse("belongsTo:project?", schema)
      expect(relation).toMatchObject({
        name: "project",
        type: "Project",
        isRequired: false,
        relationFromFields: ["projectId"],
        relationToFields: ["id"],
      })
      expect(foreignKey).toMatchObject({name: "projectId", type: "String", isRequired: false})
    })

    it("relation with list directive", () => {
      const [relation, foreignKey] = Field.parse("belongsTo:tasks[]", schema)
      expect(relation).toMatchObject({name: "tasks", type: "Task", isList: false})
      expect(foreignKey).toMatchObject({name: "tasksId", type: "Int", isList: false})
    })
  })
})
