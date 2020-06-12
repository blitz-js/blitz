import {lstatSync, promises} from 'fs'
import {join} from 'path'

const getIsBlitz = async (path: string) => {
  let isBlitz: boolean = false

  const directory = await promises.opendir(path)

  for await (const file of directory) {
    if (
      (file.isFile() && file.name === 'blitz.config.js') ||
      (file.isDirectory() && file.name === '.blitz')
    ) {
      isBlitz = true
      break
    }
  }

  return isBlitz
}

type GetDirectoriesInput = {
  path: string
}

const getDirectories = async ({path}: GetDirectoriesInput) => {
  const files = await promises.readdir(path)

  const directories = files.filter((file) => {
    const isDirectory = lstatSync(join(path, file)).isDirectory()

    return isDirectory
  })

  const directoriesMeta = Promise.all(
    directories.map(async (directory) => {
      const isBlitz = await getIsBlitz(join(path, directory))

      return {
        name: directory,
        path: join(path, directory),
        isBlitz,
      }
    }),
  )

  return directoriesMeta
}

export default getDirectories
