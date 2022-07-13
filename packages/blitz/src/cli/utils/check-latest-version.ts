import fetch, {FetchError} from "node-fetch"
import findUp from "find-up"
import resolveFrom from "resolve-from"
import {join, dirname} from "path"
import fs from "fs"
import {readVersions, resolveVersionType} from "./read-versions"
import {getPkgManager} from "./helpers"

const BLITZ_ENDPOINT = `https://registry.npmjs.org/-/package/blitz/dist-tags?foo=bar`
const BLITZ_AUTH_ENDPOINT = `https://registry.npmjs.org/-/package/@blitzjs/auth/dist-tags?foo=bar`
const BLITZ_NEXT_ENDPOINT = `https://registry.npmjs.org/-/package/@blitzjs/next/dist-tags?foo=bar`
const BLITZ_RPC_ENDPOINT = `https://registry.npmjs.org/-/package/@blitzjs/rpc/dist-tags?foo=bar`

function getUpdateString(isGlobal?: boolean) {
  const pkgManager = getPkgManager()
  switch (pkgManager) {
    case "npm":
      return `npm install ${isGlobal ? "-g" : ""} blitz`
    case "yarn":
      return `yarn ${isGlobal ? "global" : ""} add blitz`
    case "pnpm":
      return `pnpm install ${isGlobal ? "-g" : ""} blitz`
  }
}

async function findNodeModulesRoot(src: string) {
  let root: string
  const blitzPkgLocation = dirname(
    (await findUp("package.json", {
      cwd: resolveFrom(src, "blitz"),
    })) ?? "",
  )

  if (!blitzPkgLocation) {
    throw new Error("Internal Blitz Error: unable to find 'blitz' package location")
  }

  if (blitzPkgLocation.includes(".pnpm")) {
    root = join(blitzPkgLocation, "../../../../")
  } else {
    root = join(blitzPkgLocation, "../")
  }

  return root
}

export async function checkLatestVersion() {
  const versions = readVersions()
  const nodeModulesRoot = await findNodeModulesRoot(process.cwd())
  const dotBlitzCacheExists = fs.existsSync(
    join(nodeModulesRoot, ".blitz", "checkUpdateCache.json"),
  )
  let dotBlitzCache
  let shouldRun

  if (dotBlitzCacheExists) {
    dotBlitzCache = fs.readFileSync(join(nodeModulesRoot, ".blitz", "checkUpdateCache.json"))
    const now = new Date()
    const msBetweenTimes = Math.abs(
      new Date(JSON.parse(dotBlitzCache.toString())["lastUpdated"]).getTime() - now.getTime(),
    )
    const hoursBetweenTimes = msBetweenTimes / (60 * 60 * 1000)
    shouldRun = hoursBetweenTimes > 24
  }

  if (shouldRun) {
    try {
      const blitzResponse = await fetch(BLITZ_ENDPOINT)
      const remoteBlitzVersions = (await blitzResponse.json()) as Record<string, string>

      const blitzNextResponse = await fetch(BLITZ_NEXT_ENDPOINT)
      const remoteBlitzNextVersions = (await blitzNextResponse.json()) as Record<string, string>

      const blitzAuthResponse = await fetch(BLITZ_AUTH_ENDPOINT)
      const remoteBlitzAuthVersions = (await blitzAuthResponse.json()) as Record<string, string>

      const blitzRpcResponse = await fetch(BLITZ_RPC_ENDPOINT)
      const remoteBlitzRpcVersions = (await blitzRpcResponse.json()) as Record<string, string>

      for (const version of Object.entries(versions)) {
        if (version[0] === "globalVersion") {
          const versionType = resolveVersionType(version[1] as string)

          if (remoteBlitzVersions.hasOwnProperty("beta") && versionType !== "beta") {
            console.log(
              `⚠️  There is a new version of blitz available: ${remoteBlitzVersions["beta"]}. Please install it globally`,
            )
          } else if (remoteBlitzVersions[versionType] !== version[1]) {
            console.log(
              `⚠️  There is a new version of blitz available: ${remoteBlitzVersions[versionType]}. Please install it globally`,
            )
          }
        } else if (version[0] === "localVersions") {
          for (const localVersion of Object.entries(version[1])) {
            const versionType = resolveVersionType(localVersion[1] as string)

            switch (localVersion[0]) {
              case "blitz":
                if (remoteBlitzVersions.hasOwnProperty("beta") && versionType !== "beta") {
                  console.log(
                    `⚠️  There is a new version of blitz available: ${remoteBlitzVersions["beta"]}`,
                  )
                } else if (remoteBlitzVersions[versionType] !== localVersion[1]) {
                  console.log(
                    `⚠️  There is a new version of blitz available: ${remoteBlitzVersions[versionType]}`,
                  )
                }
                break
              case "blitzAuth":
                if (remoteBlitzAuthVersions.hasOwnProperty("beta") && versionType !== "beta") {
                  console.log(
                    `⚠️  There is a new version of @blitzjs/auth available: ${remoteBlitzAuthVersions["beta"]}`,
                  )
                } else if (remoteBlitzAuthVersions[versionType] !== localVersion[1]) {
                  console.log(
                    `⚠️  There is a new version of @blitzjs/auth available: ${remoteBlitzAuthVersions[versionType]}`,
                  )
                }
                break
              case "blitzNext":
                if (remoteBlitzNextVersions.hasOwnProperty("beta") && versionType !== "beta") {
                  console.log(
                    `⚠️  There is a new version of @blitzjs/next available: ${remoteBlitzNextVersions["beta"]}`,
                  )
                } else if (remoteBlitzNextVersions[versionType] !== localVersion[1]) {
                  console.log(
                    `⚠️  There is a new version of @blitzjs/next available: ${remoteBlitzNextVersions[versionType]}`,
                  )
                }
                break
              case "blitzRpc":
                if (remoteBlitzRpcVersions.hasOwnProperty("beta") && versionType !== "beta") {
                  console.log(
                    `⚠️  There is a new version of @blitzjs/rpc available: ${remoteBlitzRpcVersions["beta"]}`,
                  )
                } else if (remoteBlitzRpcVersions[versionType] !== localVersion[1]) {
                  console.log(
                    `⚠️  There is a new version of @blitzjs/rpc available: ${remoteBlitzRpcVersions[versionType]}`,
                  )
                }
                break
            }
          }
        }
      }

      const dotBlitz = join(nodeModulesRoot, ".blitz")
      fs.writeFileSync(
        join(dotBlitz, "checkUpdateCache.json"),
        JSON.stringify({lastUpdated: new Date()}),
      )
    } catch (err) {
      if (err instanceof FetchError) {
        // TODO: Check if network error and throw otherwise
        // pass fetch error
      } else {
        console.log(err)
      }
    }
  }
}
