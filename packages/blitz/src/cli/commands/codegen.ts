import {CliCommand} from "../index"
/* @ts-ignore */
import {generateManifest} from "../utils/routes-manifest"
import resolveCwd from "resolve-cwd"
import {join} from "path"
import fs from "fs-extra"

const codegen: CliCommand = async () => {
  try {
    /* 
      Updates the user's nextjs file and adds onRecoverableError to the hydrateRoot 3rd parameter object.
      We can remove this when https://github.com/vercel/next.js/pull/38207 is merged into next.js
    */
    const nextDir = await resolveCwd("next")
    const nextClientIndex = join(nextDir, "../..", "client", "index.js")
    const readFile = await fs.readFile(nextClientIndex)
    const updatedFile = readFile
      .toString()
      .replace(
        /ReactDOM\.hydrateRoot\(.*?\);/,
        `ReactDOM.hydrateRoot(domEl, reactEl, process.env.NODE_ENV === 'development' ? {onRecoverableError: (err) => err.toString().includes("could not finish this Suspense boundary") ? null : console.error(err)} : undefined);`,
      )
    await fs.writeFile(nextClientIndex, updatedFile)
  } catch (err) {
    console.log(err)
  }

  try {
    await generateManifest()
  } catch (err) {
    console.log(err)
  }

  process.exit(0)
}

export {codegen}
