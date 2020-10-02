import {Field} from "../../src/prisma/field"

describe("Field model", () => {
  it("generates models for simple scalar types, making fields singular", () => {
    expect(Field.parse("name:string").toString()).toMatchInlineSnapshot(`"name  String"`)
    expect(Field.parse("userId: int").toString()).toMatchInlineSnapshot(`"userId   int"`)
  })

  it("generates models for pluralized property, making pluralized name fields", () => {
    expect(Field.parse("names:string").toString()).toMatchInlineSnapshot(`"names  String"`)
    expect(Field.parse("userIds: int").toString()).toMatchInlineSnapshot(`"userIds   int"`)
  })

  it("serializes optional types", () => {
    expect(Field.parse("name:string?").toString()).toMatchInlineSnapshot(`"name  String?"`)
  })

  it("serializes list types, pluralizing fields", () => {
    expect(Field.parse("users:int[]").toString()).toMatchInlineSnapshot(`"users  Int[]"`)
    expect(Field.parse("user:int[]").toString()).toMatchInlineSnapshot(`"user  Int[]"`)
  })

  it("appends simple attributes", () => {
    expect(Field.parse("email:string?:unique").toString()).toMatchInlineSnapshot(
      `"email  String?  @unique"`,
    )
    expect(Field.parse("updatedAt:DateTime:updatedAt").toString()).toMatchInlineSnapshot(
      `"updatedAt  DateTime  @updatedAt"`,
    )
  })

  it("handles single default attribute", () => {
    expect(Field.parse("isActive:boolean:default[true]").toString()).toMatchInlineSnapshot(
      `"isActive  Boolean  @default(true)"`,
    )
  })

  it("handles built-in default attribute", () => {
    expect(Field.parse("id:string:default[uuid]").toString()).toMatchInlineSnapshot(
      `"id  String  @default(uuid())"`,
    )
    expect(Field.parse("id:int:default[autoincrement]"))
  })

  it("has default field type", () => {
    expect(Field.parse("name").toString()).toMatchInlineSnapshot(`"name  String"`)
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

  it("handles hasOne relations", () => {
    expect(Field.parse("hasOne:task").toString()).toMatchInlineSnapshot(`"task  Task"`)
    expect(Field.parse("hasOne:tasks").toString()).toMatchInlineSnapshot(`"tasks  Task"`)
    expect(Field.parse("hasOne:task?").toString()).toMatchInlineSnapshot(`"task  Task?"`)
    expect(Field.parse("hasOne:tasks?").toString()).toMatchInlineSnapshot(`"tasks  Task?"`)
    // list identifier should be ignored for singular relations
    expect(Field.parse("hasOne:task[]").toString()).toMatchInlineSnapshot(`"task  Task"`)
    expect(Field.parse("hasOne:tasks[]").toString()).toMatchInlineSnapshot(`"tasks  Task"`)
  })

  it("handles hasMany relations", () => {
    expect(Field.parse("hasMany:task").toString()).toMatchInlineSnapshot(`"task  Task[]"`)
    expect(Field.parse("hasMany:tasks").toString()).toMatchInlineSnapshot(`"tasks  Task[]"`)
    expect(Field.parse("hasMany:task[]").toString()).toMatchInlineSnapshot(`"task  Task[]"`)
    expect(Field.parse("hasMany:tasks[]").toString()).toMatchInlineSnapshot(`"tasks  Task[]"`)
    // can't have optional lists, should erase optional param
    expect(Field.parse("hasMany:task?").toString()).toMatchInlineSnapshot(`"task  Task[]"`)
  })

  it("handles belongsTo relations", () => {
    expect(Field.parse("belongsTo:task").join("\n")).toMatchInlineSnapshot(`
      "task  Task  @relation(fields: [taskId], references: [id])
      taskId  Int"
    `)
    expect(Field.parse("belongsTo:tasks").join("\n")).toMatchInlineSnapshot(`
      "tasks  Task  @relation(fields: [tasksId], references: [id])
      tasksId  Int"
    `)
    expect(Field.parse("belongsTo:task?").join("\n")).toMatchInlineSnapshot(`
      "task  Task?  @relation(fields: [taskId], references: [id])
      taskId  Int?"
    `)
    expect(Field.parse("belongsTo:tasks?").join("\n")).toMatchInlineSnapshot(`
      "tasks  Task?  @relation(fields: [tasksId], references: [id])
      tasksId  Int?"
    `)
    // ignore list directives, not a valid relation type
    expect(Field.parse("belongsTo:tasks[]").join("\n")).toMatchInlineSnapshot(`
      "tasks  Task  @relation(fields: [tasksId], references: [id])
      tasksId  Int"
    `)
  })
})
