import {resolver} from "blitz"
import db from "db"
import * as z from "zod"

const CreateProject = z
  .object({
    name: z.string(),
  })
  .nonstrict()

export default resolver.pipe(resolver.zod(CreateProject), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const project = await db.project.create({data: input})

  return project
})
