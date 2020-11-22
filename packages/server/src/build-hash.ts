import {hashElement,HashElementNode} from "folder-hash"
import {pathExists,readFile,writeFile} from "fs-extra"
import {resolve} from "path"

const debug = require("debug")("blitz:build-hash")

export async function getInputArtifacts() {
  const options = {
    algo: "md5",
    folders: {
      exclude: [".*", "node_modules", "cypress", "test", "tests", "spec", "specs", "build", "dist"],
    },
    files: {
      exclude: [".tsbuildinfo"],
    },
  }
  const tree = await hashElement(".", options)
  return tree
}

export async function alreadyBuilt(buildFolder: string = ".blitz/caches") {
  const hashStore = resolve(buildFolder, "last-build.json")
  if (!(await pathExists(hashStore))) {
    debug(`hashStore does not exist at ${hashStore}`)
    return false
  }

  try {
    const buffer = await readFile(hashStore)
    const expected = await getInputArtifacts()
    const actual: HashElementNode = JSON.parse(buffer.toString())

    const isMatch = actual.hash === expected.hash
    if (!isMatch) {
      debug(`hash mismatch`, {
        expected: JSON.stringify(expected),
        actual: JSON.stringify(actual)
      })
    }
    return isMatch
  } catch (err) {
    debug(`hash compare error:`, err)
    return false
  }
}

export async function saveBuild(buildFolder: string = ".blitz/caches") {
  const hashStore = resolve(buildFolder, "last-build.json")
  const hash = await getInputArtifacts()

  await writeFile(hashStore, JSON.stringify(hash))
}
