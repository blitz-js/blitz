import {resolver} from "blitz"
import db from "db"
import * as z from "zod"

const DeleteProject = z
  .object({
    id: z.number(),
  })
  .nonstrict()

export default resolver.pipe(resolver.zod(DeleteProject), resolver.authorize(), async ({id}) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const project = await db.project.delete({where: {id}})

  return project
})
