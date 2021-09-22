import {promises as fs} from "fs"
import path from "path"

type Filter = (name: string, dir: string) => boolean

export async function readdirRecursive(root: string, filter?: Filter, dir = ""): Promise<string[]> {
  const absoluteDir = path.resolve(root, dir)
  const dirStats = await fs.stat(absoluteDir)

  if (dirStats.isDirectory()) {
    let entries = await fs.readdir(absoluteDir)

    if (filter) {
      entries = entries.filter((name) => filter(name, dir))
    }

    const recursiveList = await Promise.all(
      entries.map((name) => readdirRecursive(root, filter, path.join(dir, name))),
    )
    return recursiveList.flat(Infinity) as string[]
  } else {
    return [dir]
  }
}
