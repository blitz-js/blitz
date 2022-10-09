import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateProject = z.object({
  id: z.number(),
  name: z.string(),
  // template: __fieldName__: z.__zodType__(),
})

export default resolver.pipe(
  resolver.zod(UpdateProject),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const project = await db.project.update({ where: { id }, data })

    return project
  }
)
