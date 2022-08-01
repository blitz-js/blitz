import findUp from "find-up"
import resolveFrom from "resolve-from"
import {join, dirname} from "path"
import fs from "fs"
import {readVersions, resolveVersionType} from "./read-versions"
import {getPkgManager} from "./helpers"
import superjson from "superjson"
import {isInternalBlitzMonorepoDevelopment} from "./helpers"

const returnNpmEndpoint = (packageName: string) => {
  return `https://registry.npmjs.org/-/package/${packageName}/dist-tags`
}

function getUpdateString(packageName: string, tag: string, isGlobal?: boolean) {
  const pkgManager = getPkgManager()
  switch (pkgManager) {
    case "npm":
      return `npm install${isGlobal ? " -g" : ""} ${packageName}@${tag}`
    case "yarn":
      return `yarn${isGlobal ? " global" : ""} add ${packageName}@${tag}`
    case "pnpm":
      return `pnpm install${isGlobal ? " -g" : ""} ${packageName}@${tag}`
  }
}

async function findNodeModulesRoot(src: string) {
  const blitzPkgLocation = dirname(
    (await findUp("package.json", {
      cwd: resolveFrom(src, "blitz"),
    })) ?? "",
  )

  if (!blitzPkgLocation) {
    throw new Error("Internal Blitz Error: unable to find 'blitz' package location")
  }

  return blitzPkgLocation.includes(".pnpm")
    ? join(blitzPkgLocation, "../../../../")
    : join(blitzPkgLocation, "../")
}

export async function checkLatestVersion() {
  if (!isInternalBlitzMonorepoDevelopment) {
    const fetch = await import("node-fetch")
    const boxen = await import("boxen")
    const versions = readVersions()
    const nodeModulesRoot = await findNodeModulesRoot(process.cwd())
    const dotBlitzCacheExists = fs.existsSync(
      join(nodeModulesRoot, ".blitz", "checkUpdateCache.json"),
    )
    let dotBlitzCache
    let shouldRun = true

    if (dotBlitzCacheExists) {
      dotBlitzCache = fs.readFileSync(join(nodeModulesRoot, ".blitz", "checkUpdateCache.json"))
      const now = new Date()
      const msBetweenTimes = Math.abs(
        superjson.parse<{lastUpdated: Date}>(dotBlitzCache.toString()).lastUpdated.getTime() -
          now.getTime(),
      )
      const hoursBetweenTimes = msBetweenTimes / (60 * 60 * 1000)
      shouldRun = hoursBetweenTimes > 24
    }

    if (shouldRun) {
      let errors: {message: string; instructions: string}[] = []
      try {
        const blitzResponse = await fetch.default(returnNpmEndpoint("blitz"))
        const remoteBlitzVersions = (await blitzResponse.json()) as Record<string, string>

        const blitzNextResponse = await fetch.default(returnNpmEndpoint("@blitzjs/next"))
        const remoteBlitzNextVersions = (await blitzNextResponse.json()) as Record<string, string>

        const blitzAuthResponse = await fetch.default(returnNpmEndpoint("@blitzjs/auth"))
        const remoteBlitzAuthVersions = (await blitzAuthResponse.json()) as Record<string, string>

        const blitzRpcResponse = await fetch.default(returnNpmEndpoint("@blitzjs/rpc"))
        const remoteBlitzRpcVersions = (await blitzRpcResponse.json()) as Record<string, string>

        for (const version of Object.entries(versions)) {
          if (version[0] === "globalVersion") {
            const versionType = resolveVersionType(version[1] as string)

            if (remoteBlitzVersions.hasOwnProperty("beta") && versionType !== "beta") {
              errors.push({
                message: `blitz(global) (current) ${version[1]} -> (latest) ${remoteBlitzVersions["beta"]}`,
                instructions: `${getUpdateString("blitz", "beta", true)}`,
              })
            } else if (remoteBlitzVersions[versionType] !== version[1]) {
              errors.push({
                message: `blitz(global) (current) ${version[1]} -> (latest) ${remoteBlitzVersions[versionType]}`,
                instructions: `${getUpdateString("blitz", versionType, true)}`,
              })
            }
          } else if (version[0] === "localVersions") {
            for (const localVersion of Object.entries(version[1])) {
              const versionType = resolveVersionType(localVersion[1] as string)

              switch (localVersion[0]) {
                case "blitz":
                  if (remoteBlitzVersions.hasOwnProperty("beta") && versionType !== "beta") {
                    errors.push({
                      message: `blitz (current) ${localVersion[1]} -> (latest) ${remoteBlitzVersions["beta"]}`,
                      instructions: `${getUpdateString("blitz", "beta", false)}`,
                    })
                  } else if (remoteBlitzVersions[versionType] !== localVersion[1]) {
                    errors.push({
                      message: `blitz (current) ${localVersion[1]} -> (latest) ${remoteBlitzVersions[versionType]}`,
                      instructions: `${getUpdateString("blitz", versionType, false)}`,
                    })
                  }
                  break
                case "blitzAuth":
                  if (remoteBlitzAuthVersions.hasOwnProperty("beta") && versionType !== "beta") {
                    errors.push({
                      message: `@blitzjs/auth (current) ${localVersion[1]} -> (latest) ${remoteBlitzAuthVersions["beta"]}`,
                      instructions: `${getUpdateString("@blitzjs/auth", "beta", false)}`,
                    })
                  } else if (remoteBlitzAuthVersions[versionType] !== localVersion[1]) {
                    errors.push({
                      message: `@blitzjs/auth (current) ${localVersion[1]} -> (latest) ${remoteBlitzAuthVersions[versionType]}`,
                      instructions: `${getUpdateString("@blitzjs/auth", versionType, false)}`,
                    })
                  }
                  break
                case "blitzNext":
                  if (remoteBlitzNextVersions.hasOwnProperty("beta") && versionType !== "beta") {
                    errors.push({
                      message: `@blitzjs/next (current) ${localVersion[1]} -> (latest) ${remoteBlitzNextVersions["beta"]}`,
                      instructions: `${getUpdateString("@blitzjs/next", "beta", false)}`,
                    })
                  } else if (remoteBlitzNextVersions[versionType] !== localVersion[1]) {
                    errors.push({
                      message: `@blitzjs/next (current) ${localVersion[1]} -> (latest) ${remoteBlitzNextVersions[versionType]}`,
                      instructions: `${getUpdateString("@blitzjs/next", versionType, false)}`,
                    })
                  }
                  break
                case "blitzRpc":
                  if (remoteBlitzRpcVersions.hasOwnProperty("beta") && versionType !== "beta") {
                    errors.push({
                      message: `@blitzjs/rpc (current) ${localVersion[1]} -> (latest) ${remoteBlitzRpcVersions["beta"]}`,
                      instructions: `${getUpdateString("@blitzjs/rpc", "beta", false)}`,
                    })
                  } else if (remoteBlitzRpcVersions[versionType] !== localVersion[1]) {
                    errors.push({
                      message: `@blitzjs/rpc (current) ${localVersion[1]} -> (latest) ${remoteBlitzRpcVersions[versionType]}`,
                      instructions: `${getUpdateString("@blitzjs/rpc", versionType, false)}`,
                    })
                  }
                  break
              }
            }
          }
        }

        console.log(
          boxen.default(
            `You are running outdated blitz packages\n\n ${errors
              .map((e) => e.message)
              .join("\n")} \n\n Run the following to update:\n ${errors
              .map((e) => e.instructions)
              .join("\n")}`,
            {padding: 1},
          ),
        )

        const dotBlitz = join(nodeModulesRoot, ".blitz")
        fs.writeFileSync(
          join(dotBlitz, "checkUpdateCache.json"),
          superjson.stringify({lastUpdated: new Date()}),
        )
      } catch (err) {
        if (err instanceof fetch.FetchError) {
          // TODO: Check if network error and throw otherwise
          // pass fetch error
        } else {
          console.log(err)
        }
      }
    }
  }
}
