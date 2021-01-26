import {Ctx} from "blitz"
import db, {Prisma} from "db"

type CreateProjectInput = Pick<Prisma.ProjectCreateArgs, "data">
export default async function createProject({data}: CreateProjectInput, ctx: Ctx) {
  ctx.session.$authorize()

  const project = await db.project.create({data})

  return project
}
