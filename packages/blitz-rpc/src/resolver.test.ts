import {Ctx} from "blitz"
import {describe, expect, it} from "vitest"
import {z} from "zod"
import {ParserType, resolver} from "./resolver"

describe("resolver", () => {
  it("should typecheck and pass along value", async () => {
    await resolverTest({})
  })
  it("should typecheck and pass along value if sync resolver is specified", async () => {
    await resolverTest({type: "sync"})
  })
  it("should typecheck and pass along value if async resolver is specified", async () => {
    await resolverTest({type: "async"})
  })
})

const syncResolver = resolver.pipe(
  resolver.zod(
    z.object({
      email: z.string().email(),
    }),
    "sync",
  ),
  resolver.authorize({}),
  (input) => {
    return input.email
  },
)

const asyncResolver = resolver.pipe(
  resolver.zod(
    z.object({
      email: z.string().email(),
    }),
    "async",
  ),
  resolver.authorize({}),
  (input) => {
    return input.email
  },
)

const resolverTest = async ({type}: {type?: ParserType}) => {
  const resolver1 = type === "sync" ? syncResolver : asyncResolver

  const result1 = await resolver1({email: "test@example.com"}, {
    session: {$authorize: () => undefined},
  } as Ctx)
  expect(result1).toBe("test@example.com")

  const resolver2 = resolver.pipe(
    /*resolver.authorize(), */ (input: {email: string}) => {
      return input.email
    },
  )
  const result2 = await resolver2({email: "test@example.com"}, {
    session: {$authorize: () => undefined},
  } as Ctx)
  expect(result2).toBe("test@example.com")
}
