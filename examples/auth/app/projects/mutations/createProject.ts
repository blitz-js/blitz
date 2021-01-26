import {pipe} from "blitz"
import db from "db"
import * as z from "zod"

export const CreateProject = z.object({
  name: z.string(),
  dueDate: z.date().optional(),
  orgId: z.number().optional(),
})

export default pipe.resolver(
  pipe.zod(CreateProject),
  pipe.authorize(),
  // Set default orgId
  (input, {session}) => ({orgId: session.orgId, ...input}),
  async (input, ctx) => {
    console.log("Creating project...", ctx.session.orgId)
    const project = await db.project.create({
      data: input,
    })
    console.log("Created project")

    return project
  },
)
