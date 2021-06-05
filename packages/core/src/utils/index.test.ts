import {z} from "zod"
import {formatZodErrors, validateZodSchema} from "./index"
const MySchema = z.object({
  test: z.string(),
})

describe("formatZodErrors", () => {
  it("formats the zod error", () => {
    const result = MySchema.safeParse({})
    if (result.success) throw new Error("Schema should not return success")

    expect(formatZodErrors(result.error.format())).toEqual({test: "Required"})
  })

  const MyNestedSchema = z.object({
    test: z.string(),
    nested: z.object({
      foo: z.string(),
      test: z.string(),
    }),
  })

  it("formats the nested zod error", () => {
    const result = MyNestedSchema.safeParse({test: "yo", nested: {foo: "yo"}})
    if (result.success) throw new Error("Schema should not return success")

    expect(formatZodErrors(result.error.format())).toEqual({
      nested: {test: "Required"},
    })
  })

  const MyDoubleNestedSchema = z.object({
    test: z.string(),
    nested: z.object({
      test: z.string(),
      doubleNested: z.object({
        test: z.string(),
      }),
    }),
  })

  it("formats 2 levels nested zod error", () => {
    const result = MyDoubleNestedSchema.safeParse({
      nested: {doubleNested: {}},
    })
    if (result.success) throw new Error("Schema should not return success")

    expect(formatZodErrors(result.error.format())).toEqual({
      test: "Required",
      nested: {test: "Required", doubleNested: {test: "Required"}},
    })
  })
})

describe("validateZodSchema", () => {
  it("passes validation", () => {
    expect(validateZodSchema(MySchema, {test: "test"})).toEqual({})
  })

  it("fails validation", () => {
    expect(validateZodSchema(MySchema, {})).toEqual({test: "Required"})
  })
})
