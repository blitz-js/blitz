import {existsSync} from 'fs'

import db, {FindManyProjectArgs} from 'db'
import {getDirMtime} from 'utils/getDirMtime'

type GetProjectsInput = {
  where?: FindManyProjectArgs['where']
  orderBy?: FindManyProjectArgs['orderBy']
  cursor?: FindManyProjectArgs['cursor']
  take?: FindManyProjectArgs['take']
  skip?: FindManyProjectArgs['skip']
}

const getProjects = async ({where, orderBy, cursor, take, skip}: GetProjectsInput) => {
  const projects = await db.project.findMany({
    where,
    orderBy,
    cursor,
    take,
    skip,
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
