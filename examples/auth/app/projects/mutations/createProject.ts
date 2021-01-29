import {resolver} from "blitz"
import db from "db"
import * as z from "zod"

export const CreateProject = z.object({
  name: z.string(),
  dueDate: z.date().optional(),
})

export default resolver.pipe(
  resolver.zod(CreateProject),
  resolver.authorize(),
  resolver.authorizeIf((input, ctx) => input.name === ctx.session.roles[0], "admin"),
  // How to set a default input value
  (input, _ctx) => ({dueDate: new Date(), ...input}),
  async (input, _ctx) => {
    console.log("Creating project...")
    const project = await db.project.create({
      data: input,
    })
    console.log("Created project")

    return project
  },
)
