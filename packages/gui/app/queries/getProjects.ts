import {existsSync, statSync} from 'fs'

import db, {FindManyProjectArgs} from 'db'

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
  let projects = await db.project.findMany({
    where,
    orderBy,
    skip,
    first,
    last,
    after,
    before,
  })

  projects.forEach((project) => {
    if (!existsSync(project.path)) {
      projects = projects.filter((projecttoDelete) => projecttoDelete !== project)
    }
  })

  projects.forEach((project) => {
    project.lastActive = statSync(project.path).mtimeMs
  })

  projects.sort((project, secondProject) => {
    return project.lastActive > secondProject.lastActive
      ? -1
      : project.lastActive < secondProject.lastActive
      ? 1
      : 0
  })

  return projects
}

export default getProjects
