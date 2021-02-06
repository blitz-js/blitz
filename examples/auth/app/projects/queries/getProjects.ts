import {paginate, Ctx} from "blitz"
import db, {Prisma} from "db"

interface GetProjectsInput
  extends Pick<Prisma.ProjectFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default async function getProjects(
  {where, orderBy, skip = 0, take = 100}: GetProjectsInput,
  ctx: Ctx,
) {
  ctx.session.$authorize()

  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const {items: projects, hasMore, nextPage, count} = await paginate({
    skip,
    take,
    count: () => db.project.count({where}),
    query: (paginateArgs) => db.project.findMany({...paginateArgs, where, orderBy}),
  })

  return {
    projects,
    nextPage,
    hasMore,
    count,
  }
}
