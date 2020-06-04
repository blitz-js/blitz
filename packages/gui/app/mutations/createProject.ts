import {existsSync} from 'fs'
import hasbin from 'hasbin'

import {AppGenerator} from '@blitzjs/generator'
import db, {ProjectCreateArgs} from 'db'
import pkg from 'package.json'

type CreateProjectInput = {
  data: ProjectCreateArgs['data']
}

const createProject = async ({data}: CreateProjectInput) => {
  const {name, path} = data

  if (existsSync(path)) {
    return
  }

  const generator = new AppGenerator({
    destinationRoot: path,
    appName: name,
    dryRun: false,
    useTs: true,
    yarn: hasbin.sync('yarn'),
    version: pkg.version,
    skipInstall: false,
  })

  try {
    await generator.run()

    const project = await db.project.create({data})

    return project
  } catch {
    return
  }
}

export default createProject
