import { NotFoundError, ResolverConfig } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetProject = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetProject), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const project = await db.project.findFirst({ where: { id } })

  if (!project) throw new NotFoundError()

  return project
})

export const config: ResolverConfig = {
  httpMethod: "GET",
}
