import {Ctx} from "blitz"
import db from "db"
import * as z from "zod"
// import {pipe} from "fp-ts/function"
// import {pipe} from "lodash"

const pipe = <A, B, C, D, Y, Z>(
  a: (i: A, c: unknown) => B,
  b: (i: B, c: unknown) => C,
  c: (i: C, c: unknown) => D,
  d: (i: D, c: unknown) => Y,
  z: (i: Y, c: Ctx) => Z,
): ((input: A, ctx: Ctx) => Z) => {
  const functions = [a, b,c,d z] as const
  return (input, ctx) =>
    functions.reduce((lastInput: any, currentFunction) => {
      return currentFunction(lastInput, ctx)
    }, input)
}

const authorize = (role?: string, condition?: any) => <T>(input: T) => input
const validate: any

export const CreateProject = z.object({
  name: z.string(),
  dueDate: z.date().optional(),
  orgId: z.number().optional(),
})

// export default pipe(
//   CreateProject.parse,
//   (input, {session}) => ({orgId: session.orgId, ...input}),
//   authorize(),
//   authorize("admin", (input, {session}) => input.orgId !== session.orgId),
//   async (input) => {
//     console.log("Creating project...")
//     const project = await db.project.create({
//       data: input,
//     })
//     console.log("Created project")
//
//     return project
//   },
// )
//
export default validate(CreateProject, async (input, ctx) => {

  // orgId input is optional, defaults to currentOrgId
  input.orgId ??= ctx.session.orgId
  // User must be logged in
  ctx.session.authorize()
  // If input.orgId does not match the current user, require user to have admin role
  ctx.session.authorize("admin", input.orgId !== ctx.session.orgId)

  const project = await db.project.create({
    data: input,
  })

  return project
})
