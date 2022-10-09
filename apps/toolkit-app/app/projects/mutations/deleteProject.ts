import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteProject = z.object({
  id: z.number(),
})

export default resolver.pipe(resolver.zod(DeleteProject), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const project = await db.project.deleteMany({ where: { id } })

  return project
})
