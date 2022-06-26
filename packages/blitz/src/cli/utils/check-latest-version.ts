import fetch from "node-fetch"
import {gtr} from "semver"

import {readVersions, resolveVersionType} from "./read-versions"
import {getPkgManager} from "./helpers"

const ENDPOINT = `https://registry.npmjs.org/-/package/blitz/dist-tags`

export async function checkLatestVersion() {
  const localVersions = readVersions()

  const response = await fetch(ENDPOINT)
  const versions = (await response.json()) as Record<string, string>

  let version: string
  if (localVersions.globalVersion) {
    version = localVersions.globalVersion
  } else if (localVersions.localVersion) {
    version = localVersions.localVersion
  } else {
    throw new Error("Could not find local/global version")
  }

  const versionType = resolveVersionType(version)
  const latestVersion = versions[versionType]

  if (!latestVersion) {
    throw new Error(`Could not find latest version for ${versionType}`)
  }

  console.log(latestVersion, version)

  if (gtr(latestVersion, version)) {
    const pkgManager = getPkgManager()

    console.log(`Install using ${pkgManager}`)
    console.log(`⚠️  There is a new version of Blitz available: ${latestVersion}`)
  }
}
