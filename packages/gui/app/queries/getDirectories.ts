import {accessSync, constants, lstatSync, promises} from "fs"
import {join} from "path"

const getIsReadable = (path: string) => {
  try {
    accessSync(path, constants.R_OK | constants.W_OK)

    return true
  } catch {
    return false
  }
}

const getIsBlitz = async (path: string) => {
  let isBlitz: boolean = false

  const directory = await promises.opendir(path)

  for await (const file of directory) {
    if (
      (file.isFile() && file.name === "blitz.config.js") ||
      (file.isDirectory() && file.name === ".blitz")
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
    const isReadable = getIsReadable(join(path, file))
    const isNotDotFile = !/^\..*/.test(file)

    return isDirectory && isReadable && isNotDotFile
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
