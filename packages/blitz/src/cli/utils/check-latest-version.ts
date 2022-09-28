import {readVersions} from "./read-versions"
import {getGlobalPkgManager} from "./helpers"

import {isInternalBlitzMonorepoDevelopment} from "./helpers"

const returnNpmEndpoint = (packageName: string) => {
  return `https://registry.npmjs.org/-/package/${packageName}/dist-tags`
}

function getUpdateString(packageName: string, tag: string, isGlobal?: boolean) {
  const globalPkgManager = getGlobalPkgManager()

  switch (globalPkgManager) {
    case "npm":
      return `npm install${isGlobal ? " -g" : ""} ${packageName}@${tag}`
    case "yarn":
      return `yarn${isGlobal ? " global" : ""} add ${packageName}@${tag}`
    case "pnpm":
      return `pnpm install${isGlobal ? " -g" : ""} ${packageName}@${tag}`
  }
}

export async function checkLatestVersion() {
  if (!isInternalBlitzMonorepoDevelopment) {
    const fetch = await import("node-fetch")
    const boxen = await import("boxen")
    const versions = readVersions()
    const versionsArray = Object.entries(versions)

    let errors: {message: string; instructions: string}[] = []
    try {
      const blitzResponse = await fetch.default(returnNpmEndpoint("blitz"))
      const remoteBlitzVersions = (await blitzResponse.json()) as Record<string, string>

      for (const version of versionsArray) {
        const versionType: string = version[0]
        const versionValue = version[1]

        if (
          versionType === "globalVersion" &&
          typeof versionValue === "string" &&
          versionValue !== ""
        ) {
          if (remoteBlitzVersions["latest"] !== versionValue) {
            errors.push({
              message: `blitz(global) (current) ${versionValue} -> (latest) ${remoteBlitzVersions["latest"]}`,
              instructions: `${getUpdateString("blitz", "latest", true)}`,
            })
          }
        } else if (
          versionType === "localVersions" &&
          typeof versionValue === "object" &&
          versionValue.blitz &&
          versionValue.blitz !== ""
        ) {
          if (remoteBlitzVersions["latest"] !== versionValue.blitz) {
            errors.push({
              message: `blitz(current) ${versionValue.blitz} -> (latest) ${remoteBlitzVersions["latest"]}`,
              instructions: `${getUpdateString("blitz", "latest", true)}`,
            })
          }
        }
      }

      if (errors.length) {
        console.log(
          boxen.default(
            `You are running outdated blitz packages\n\n${errors
              .map((e) => e.message)
              .join("\n")} \n\nRun the following to update:\n${errors
              .map((e) => e.instructions)
              .join("\n")}`,
            {padding: 1},
          ),
        )
      }
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
