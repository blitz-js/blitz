import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateProject = z.object({
  name: z.string(),
  // template: __fieldName__: z.__zodType__(),
})

export default resolver.pipe(resolver.zod(CreateProject), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const project = await db.project.create({ data: input })

  return project
})
