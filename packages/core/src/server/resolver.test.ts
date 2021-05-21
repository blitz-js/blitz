import {z} from "zod"
import {Ctx} from "../types"
import {resolver} from "./resolver"

describe("resolver", () => {
  it("should typecheck and pass along value", async () => {
    const resolver1 = resolver.pipe(
      resolver.zod(
        z.object({
          email: z.string().email(),
        }),
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
  })
})
