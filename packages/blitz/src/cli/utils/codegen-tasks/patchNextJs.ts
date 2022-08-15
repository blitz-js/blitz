import {join} from "path"
import semver from "semver"
import resolveCwd from "resolve-cwd"
import fs from "fs-extra"

import {log} from "../../../logging"
import {getPackageJson} from "../get-package-json"

const modifyNextFile = async (
  path: string,
  replacer: (str: string) => string,
  semverCheck?: (version: string) => boolean,
) => {
  const nextDir = resolveCwd("next")
  if (semverCheck) {
    const pkgJson = await getPackageJson(nextDir)
    if (!semverCheck(pkgJson.version)) {
      return
    }
  }

  const nextClientIndex = join(nextDir, path)
  const readFile = await fs.readFile(nextClientIndex)
  const updatedFile = replacer(readFile.toString())

  await fs.writeFile(nextClientIndex, updatedFile)
}

export const patchNextSuspenseBug = async () => {
  /*
    Updates the user's nextjs file and adds onRecoverableError to the hydrateRoot 3rd parameter object.
    We can remove this when https://github.com/vercel/next.js/pull/38207 is merged into next.js
  */

  await modifyNextFile("../../client/index.js", (str) => {
    return str.replace(
      /ReactDOM\.hydrateRoot\(.*?\);/,
      `ReactDOM.hydrateRoot(domEl, reactEl, process.env.NODE_ENV === 'development' ? {onRecoverableError: (err) => err.toString().includes("could not finish this Suspense boundary") ? null : console.error(err)} : undefined);`,
    )
  })

  log.success("Next.js was successfully patched with a React Suspense fix")
}

export const patchNextConfigWarning = async () => {
  /*
    Updates the user's nextjs config validation to add blitz as a valid prop in the config schema
    We can remove this when https://github.com/vercel/next.js/issues/39606 issue gets resolved
  */

  await modifyNextFile(
    "../../client/index.js",
    (str) => {
      return str.replace(
        /type:"object",additionalProperties:false,properties:{amp:{/,
        `type:"object",additionalProperties:false,properties:{blitz:{type:"any"},amp:{`,
      )
    },
    (version) => semver.gte(version, "12.2.3"),
  )

  log.success("Next.js was successfully patched with config warning fix")
}
