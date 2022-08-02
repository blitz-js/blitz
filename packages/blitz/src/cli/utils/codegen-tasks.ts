import {generateManifest} from "./routes-manifest"
import {log} from "../../logging"
import resolveCwd from "resolve-cwd"
import {join} from "path"
import fs from "fs-extra"

export const codegenTasks = async () => {
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
    log.success("Next.js patched for suspense error issue")
  } catch (err) {
    log.error(err)
  }

  try {
    await generateManifest()
    log.success("Routes manifest generated")
  } catch (err) {
    log.error(err)
  }
}
