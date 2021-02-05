import {AuthenticatedSessionContext} from "supertokens"
import * as z from "zod"
import {resolver} from "./resolver"

describe("resolver", () => {
  it("should typecheck and pass along value", () => {
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
      f(
        {email: "test@example.com"},
        {session: {$authorize: () => {}} as AuthenticatedSessionContext},
      ),
    ).toStrictEqual("test@example.com")

    const g = resolver.pipe(resolver.authorize(), (input: {email: string}) => {
      return input.email
    })
    expect(g({email: "test@example.com"}, {})).toStrictEqual("test@example.com")
  })
})
