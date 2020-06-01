import {existsSync} from 'fs'

import db, {FindManyProjectArgs} from 'db'
import {getDirMtime} from 'utils/getDirMtime'

type GetProjectsInput = {
  where?: FindManyProjectArgs['where']
  orderBy?: FindManyProjectArgs['orderBy']
  skip?: FindManyProjectArgs['skip']
  first?: FindManyProjectArgs['first']
  last?: FindManyProjectArgs['last']
  after?: FindManyProjectArgs['after']
  before?: FindManyProjectArgs['before']
}

const getProjects = async ({where, orderBy, skip, first, last, after, before}: GetProjectsInput) => {
  const projects = await db.project.findMany({
    where,
    orderBy,
    skip,
    first,
    last,
    after,
    before,
  })

  const existingProjects = projects.filter((project) => existsSync(project.path))

  const projectsWithMtime = await Promise.all(
    existingProjects.map(async (project) => {
      const lastActive = await getDirMtime(project.path)

      return {
        ...project,
        lastActive,
      }
    }),
  )

  const sortedProjects = projectsWithMtime.sort((project, secondProject) => {
    return project.lastActive > secondProject.lastActive
      ? -1
      : project.lastActive < secondProject.lastActive
      ? 1
      : 0
  })

  return sortedProjects
}

export default getProjects
