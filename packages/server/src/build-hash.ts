import {hashElement} from "folder-hash"
import {pathExists, readFile, writeFile} from "fs-extra"
import {resolve} from "path"

export async function getInputArtefactsHash() {
  const options = {
    algo: "md5",
    folders: {
      exclude: [
        "node_modules",
        ".blitz-build",
        ".blitz",
        "cypress",
        ".next",
        ".heroku",
        ".profile.d",
        ".cache",
        ".config",
        "test",
      ],
    },
  }
  const tree = await hashElement(".", options)
  return tree.hash
}

export async function alreadyBuilt(buildFolder: string = ".blitz/caches") {
  const hashStore = resolve(buildFolder, "last-build")
  if (!(await pathExists(hashStore))) return false

  try {
    const buffer = await readFile(hashStore)
    const hash = await getInputArtefactsHash()
    const read = buffer.toString().replace("\n", "")
    return read === hash
  } catch (err) {
    return false
  }
}

export async function saveBuild(buildFolder: string = ".blitz/caches") {
  const hashStore = resolve(buildFolder, "last-build")
  const hash = await getInputArtefactsHash()
  await writeFile(hashStore, hash)
}
