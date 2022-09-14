import {generateManifest} from "./routes-manifest"
import {log} from "../../logging"
import resolveCwd from "resolve-cwd"
import {join} from "path"
import fs from "fs-extra"
import {getPackageJson} from "./get-package-json"
import {runPrisma} from "../../utils/run-prisma"
import os from "os"

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
        `ReactDOM.hydrateRoot(domEl, reactEl, {onRecoverableError: (err) => (err.toString().includes("could not finish this Suspense boundary") || err.toString().includes("Minified React error #419")) ? null : console.error(err)});`,
      )
    await fs.writeFile(nextClientIndex, updatedFile)
    log.success("Next.js was successfully patched with a React Suspense fix")
  } catch (err) {
    log.error(JSON.stringify(err, null, 2))
  }

  try {
    await generateManifest()
    log.success("Routes manifest was successfully generated")

    const {dependencies, devDependencies} = await getPackageJson()

    const hasPrisma = Object.keys({...dependencies, ...devDependencies}).some(
      (name) => name === "prisma",
    )

    if (hasPrisma) {
        const tempDir = os.tmpdir()
        const creationDate = await fs.stat(process.cwd())
        if (!fs.existsSync(join(tempDir, `blitz-${creationDate.birthtimeMs}-prisma-client.json`))) {
            const lastModified = await fs.stat(join(process.cwd(), "db/schema.prisma"))
            await fs.writeFile(
                join(tempDir, `blitz-${creationDate.birthtimeMs}-prisma-client.json`),
                JSON.stringify({ lastModified: lastModified.mtimeMs }),
            )
        }
        const prismaStatus = await fs.readJson(join(tempDir, `blitz-${creationDate.birthtimeMs}-prisma-client.json`))
        const lastModified = await fs.stat(join(process.cwd(), "db/schema.prisma"))
        if (prismaStatus.lastModified !== lastModified.mtimeMs) {
            let prismaSpinner = log.spinner(`Generating Prisma client`).start()
            const result = await runPrisma(["generate"], true)
            if (result.success) {
                prismaSpinner.succeed(log.greenText("Generated Prisma client"))
            } else {
                prismaSpinner.fail()
                console.log("\n" + result.stderr)
                process.exit(1)
            }
            await fs.writeJson(join(process.cwd(), `blitz-${creationDate.birthtimeMs}-prisma-client.json`), {
                lastModified: lastModified.mtimeMs,
            })
        } else {
            log.success("Prisma client was up to date")
        }
    }
  } catch (err) {
    log.error(JSON.stringify(err, null, 2))
  }
}
