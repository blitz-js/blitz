import {z} from "zod"
import {formatZodErrors} from "./index"

describe("formatZodErrors", () => {
  const MySchema = z.object({
    test: z.string(),
  })

  it("formats the zod error", () => {
    const result = MySchema.safeParse({})
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

    expect(formatZodErrors(result.error.format())).toEqual({
      nested: {test: "Required"},
    })
  })

  const MyDoubleNestedSchema = z.object({
    test: z.string(),
    nested: z.object({
      foo: z.string(),
      doubleNested: z.object({
        yo: z.string(),
      }),
    }),
  })

  it("formats 2 levels nested zod error", () => {
    const result = MyDoubleNestedSchema.safeParse({
      nested: {doubleNested: {}},
    })

    expect(formatZodErrors(result.error.format())).toEqual({
      test: "Required",
      nested: {foo: "Required", doubleNested: {yo: "Required"}},
    })
  })
})
