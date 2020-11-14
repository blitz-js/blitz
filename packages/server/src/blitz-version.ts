import {pathExists, readFile, writeFile} from "fs-extra"
import {resolve} from "path"

export const blitzVersionFilename = "blitz-version.txt"

export function getBlitzVersion(): string {
  try {
    const path = require.resolve("blitz/package.json")
    const pkgJson = require(path)
    return pkgJson.version as string
  } catch {
    return ""
  }
}

export async function isVersionMatched(buildFolder: string = ".blitz/caches") {
  const versionStore = resolve(buildFolder, blitzVersionFilename)
  if (!(await pathExists(versionStore))) return false

  try {
    const buffer = await readFile(versionStore)
    const version = getBlitzVersion()
    const read = buffer.toString().trim().replace("\n", "")
    return read === version
  } catch (err) {
    return false
  }
}

export async function saveBlitzVersion(buildFolder: string = ".blitz/caches") {
  const versionStore = resolve(buildFolder, blitzVersionFilename)
  const version = getBlitzVersion()
  await writeFile(versionStore, version)
}
