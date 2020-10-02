import {Ctx} from "./middleware"
import * as z from "zod"

export type ProtectArgs<T> = {schema?: T; authorize?: boolean | unknown}

export const protect = <T extends z.ZodSchema<any, any>, U = z.infer<T>>(
  {schema, authorize = true}: ProtectArgs<T>,
  resolver: (args: U, ctx: Ctx) => any,
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
    return resolver(input, ctx)
  }
}
