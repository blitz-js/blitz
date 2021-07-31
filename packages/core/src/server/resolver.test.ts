import {z} from "zod"
import {Ctx} from "../types"
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

const resolverTest = async ({type}: {type?: ParserType}) => {
  const resolver1 = resolver.pipe(
    resolver.zod(
      z.object({
        email: z.string().email(),
      }),
      type
    ),
    resolver.authorize(),
    (input) => {
      return input.email
    },
  )
  const result1 = await resolver1(
    {email: "test@example.com"},
    {session: {$authorize: () => undefined} as Ctx},
  )
  expect(result1).toBe("test@example.com")

  const resolver2 = resolver.pipe(
    /*resolver.authorize(), */ (input: {email: string}) => {
      return input.email
    },
  )
  const result2 = await resolver2(
    {email: "test@example.com"},
    {session: {$authorize: () => undefined} as Ctx},
  )
  expect(result2).toBe("test@example.com")
}
