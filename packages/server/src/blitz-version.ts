import {pathExists, readFile, writeFile} from "fs-extra"
import {resolve} from "path"

export function getBlitzVersion(): string | null {
  try {
    const path = require.resolve("blitz/package.json")
    const pkgJson = require(path)
    return pkgJson.version
  } catch {
    return null
  }
}

export async function isVersionMatched(buildFolder: string = ".blitz/caches") {
  const versionStore = resolve(buildFolder, "blitz-version")
  if (!(await pathExists(versionStore))) return false

  try {
    const buffer = await readFile(versionStore)
    const version = getBlitzVersion()
    const read = buffer.toString().replace("\n", "")
    return read === version
  } catch (err) {
    return false
  }
}

export async function saveBlitzVersion(buildFolder: string = ".blitz/caches") {
  const versionStore = resolve(buildFolder, "blitz-version")
  const version = getBlitzVersion()
  await writeFile(versionStore, version)
}
