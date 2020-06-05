import {existsSync} from 'fs'

import db, {FindOneProjectArgs} from 'db'
import {getDirMtime} from 'utils/getDirMtime'

type GetProjectInput = {
  where: FindOneProjectArgs['where']
}

const getProject = async ({where}: GetProjectInput) => {
  const project = await db.project.findOne({where})

  if (!project) {
    return null
  }

  if (!existsSync(project.path)) {
    return null
  }

  project.lastActive = await getDirMtime(project.path)

  return project
}

export default getProject
