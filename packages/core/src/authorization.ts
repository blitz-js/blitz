import {Ctx} from "./middleware"
import {AuthenticatedSessionContext} from "./supertokens"
import {ZodSchema, infer as zInfer} from "zod"

export type ProtectArgs<T> = {schema?: T; authorize?: boolean | unknown}

interface AuthenticatedCtx extends Ctx {
  session: AuthenticatedSessionContext
}

export const protect = <T extends ZodSchema<any, any>, U = zInfer<T>>(
  {schema, authorize = true}: ProtectArgs<T>,
  resolver: (args: U, ctx: AuthenticatedCtx) => any,
) => {
  return (rawInput: U, ctx: Ctx) => {
    if (authorize) {
      const authorizeInput: any[] = ["superadmin", "SUPERADMIN"]
      if (Array.isArray(authorize)) {
        authorizeInput.push(...authorize)
      } else if (typeof authorize !== "boolean") {
        authorizeInput.push(authorize)
      }
      ;(ctx as any).session.authorize(authorizeInput)
    }
    const input = schema ? schema.parse(rawInput) : rawInput
    return resolver(input, ctx as AuthenticatedCtx)
  }
}
