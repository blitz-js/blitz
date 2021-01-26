import {Ctx, NotFoundError} from "blitz"
import db, {Prisma} from "db"

type GetProjectInput = Pick<Prisma.ProjectFindFirstArgs, "where">

export default async function getProject({where}: GetProjectInput, ctx: Ctx) {
  ctx.session.$authorize()

  const project = await db.project.findFirst({where})

  if (!project) throw new NotFoundError()

  return project
}
