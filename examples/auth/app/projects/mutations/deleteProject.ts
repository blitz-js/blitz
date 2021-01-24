import {Ctx} from "blitz"
import db, {Prisma} from "db"

type DeleteProjectInput = Pick<Prisma.ProjectDeleteArgs, "where">

export default async function deleteProject({where}: DeleteProjectInput, ctx: Ctx) {
  ctx.session.authorize()

  const project = await db.project.delete({where})

  return project
}
