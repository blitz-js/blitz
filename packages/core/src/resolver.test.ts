import {AuthenticatedSessionContext} from "supertokens"
import * as z from "zod"
import {resolver} from "./resolver"

describe("resolver", () => {
  it("should typecheck and pass along value", async () => {
    const f = resolver.pipe(
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
    expect(
      await f(
        {email: "test@example.com"},
        {session: {$authorize: (i) => i} as AuthenticatedSessionContext},
      ),
    ).toBe("test@example.com")

    const g = resolver.pipe(resolver.authorize(), (input: {email: string}) => {
      return input.email
    })
    expect(
      await g(
        {email: "test@example.com"},
        {session: {$authorize: (i) => i} as AuthenticatedSessionContext},
      ),
    ).toBe("test@example.com")
  })
})
