import {describe, it, expect} from "vitest"
import {z} from "zod"
import {formatZodError, validateZodSchema} from "../src/utils/zod"

const validateSchema = (schema: any, input: any) => {
  const result = schema.safeParse(input)
  if (result.success) throw new Error("Schema should not return success")
  return result
}

const Schema = z.object({
  test: z.string(),
})

describe("formatZodError", () => {
  it("formats the zod error", () => {
    expect(formatZodError(validateSchema(Schema, {}).error)).toEqual({
      test: "Required",
    })
  })

  it("formats the nested zod error", () => {
    const NestedSchema = z.object({
      test: z.string(),
      nested: z.object({
        foo: z.string(),
        test: z.string(),
      }),
    })

    const result = validateSchema(NestedSchema, {
      test: "yo",
      nested: {foo: "yo"},
    })
    expect(formatZodError(result.error)).toEqual({
      nested: {test: "Required"},
    })
  })

  it("formats 2 levels nested zod error", () => {
    const DoubleNestedSchema = z.object({
      test: z.string(),
      nested: z.object({
        test: z.string(),
        doubleNested: z.object({
          test: z.string(),
        }),
      }),
    })

    expect(
      formatZodError(
        validateSchema(DoubleNestedSchema, {
          nested: {doubleNested: {}},
        }).error,
      ),
    ).toEqual({
      test: "Required",
      nested: {test: "Required", doubleNested: {test: "Required"}},
    })
  })

  it("formats arrays", () => {
    const NestedSchema = z.object({
      students: z.array(
        z.object({
          name: z.string(),
        }),
      ),
      data: z.object({
        1: z.literal(true),
      }),
    })

    const result = validateSchema(NestedSchema, {
      students: [{name: "hi"}, {wat: true}, {name: true}],
      data: {},
    })
    expect(formatZodError(result.error)).toEqual({
      students: [undefined, {name: "Required"}, {name: "Expected string, received boolean"}],
      data: [undefined, "Invalid literal value, expected true"],
    })
  })
})

describe("validateZodSchema", () => {
  it("passes validation", async () => {
    expect(await validateZodSchema(Schema)({test: "test"})).toEqual({})
  })

  it("fails validation", async () => {
    expect(await validateZodSchema(Schema)({})).toEqual({test: "Required"})
  })

  it("passes validation if synchronous", () => {
    expect(validateZodSchema(Schema, "sync")({test: "test"})).toEqual({})
  })

  it("fails validation if synchronous", () => {
    expect(validateZodSchema(Schema, "sync")({})).toEqual({test: "Required"})
  })
})
