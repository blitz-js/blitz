import {describe, it, expect} from "vitest"
import {Schema} from "@mrleebo/prisma-ast"
import {Field} from "../../src/prisma/field"

describe("Field", () => {
  it("parses optional types", async () => {
    const [field] = await Field.parse("name:string?")
    expect(field?.isRequired).toBe(false)
  })

  it("appends unique attribute", async () => {
    const [field] = await Field.parse("email:string?:unique")
    expect(field?.isUnique).toBe(true)
  })

  it("appends updatedAt attribute", async () => {
    const [field] = await Field.parse("updatedAt:DateTime:updatedAt")
    expect(field?.isUpdatedAt).toBe(true)
  })

  it("handles default simple attribute", async () => {
    const [field] = await Field.parse("isActive:boolean:default=true")
    expect(field?.default).toBe("true")
  })

  it("handles default uuid attribute", async () => {
    const [field] = await Field.parse("id:string:default=uuid")
    expect(field?.default).toMatchObject({name: "uuid"})
  })

  it("handles uuid convenience syntax", async () => {
    const [field] = await Field.parse("someSpecialToken:uuid")
    expect(field?.type).toBe("String")
    expect(field?.default).toMatchObject({name: "uuid"})
  })

  it("handles default autoincrement attribute", async () => {
    const [field] = await Field.parse("id:int:default=autoincrement")
    expect(field?.default).toMatchObject({name: "autoincrement"})
  })

  it("has default field type", async () => {
    const [field] = await Field.parse("name")
    expect(field?.type).toBe("String")
  })

  it("allow number characters in model name", async () => {
    const [field] = await Field.parse("name2")
    expect(field?.name).toBe("name2")
  })

  it("allow underscore characters in model name", async () => {
    const [field] = await Field.parse("first_name")
    expect(field?.name).toBe("first_name")
  })

  it("disallows number as a first character in model name", async () => {
    await expect(async () => await Field.parse("2first")).rejects.toThrow()
  })

  it("disallows underscore as a first character in model name", async () => {
    await expect(async () => await Field.parse("_first")).rejects.toThrow()
  })

  it("disallows special characters in model name", async () => {
    await expect(async () => await Field.parse("app-user:int")).rejects.toThrow()
  })

  it("disallows optional list fields", async () => {
    await expect(async () => await Field.parse("users:int?[]")).rejects.toThrow()
  })

  it("requires a name", async () => {
    await expect(async () => await Field.parse(":int")).rejects.toThrow()
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

    it("simple relation", async () => {
      const [relation, foreignKey] = await Field.parse("belongsTo:task")
      expect(relation).toMatchObject({
        name: "task",
        type: "Task",
        relationFromFields: ["taskId"],
        relationToFields: ["id"],
      })
      expect(foreignKey).toMatchObject({name: "taskId", type: "Int"})
    })

    it("relation with schema", async () => {
      const [relation, foreignKey] = await Field.parse("belongsTo:project?", schema)
      expect(relation).toMatchObject({
        name: "project",
        type: "Project",
        isRequired: false,
        relationFromFields: ["projectId"],
        relationToFields: ["id"],
      })
      expect(foreignKey).toMatchObject({name: "projectId", type: "String", isRequired: false})
    })

    it("relation with list directive", async () => {
      const [relation, foreignKey] = await Field.parse("belongsTo:tasks[]", schema)
      expect(relation).toMatchObject({name: "tasks", type: "Task", isList: false})
      expect(foreignKey).toMatchObject({name: "tasksId", type: "Int", isList: false})
    })
  })
})
