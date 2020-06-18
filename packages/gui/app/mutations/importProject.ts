import db, {ProjectCreateArgs} from 'db'

type ImportProjectInput = {
  data: ProjectCreateArgs['data']
}

const importProject = async ({data}: ImportProjectInput) => {
  const {path} = data

  const existingProjects = await db.project.findMany({where: {path}})

  if (existingProjects.length > 0) {
    return
  }

  try {
    const project = await db.project.create({data})

    return project
  } catch {
    return
  }
}

export default importProject
