import {Ctx} from "blitz"
import db, {Prisma} from "db"

type UpdateProjectInput = Pick<Prisma.ProjectUpdateArgs, "where" | "data">

export default async function updateProject({where, data}: UpdateProjectInput, ctx: Ctx) {
  ctx.session.$authorize()

  const project = await db.project.update({where, data})

  return project
}
