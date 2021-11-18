require("v8-compile-cache")
const cacheFile = require("path").join(__dirname, ".blitzjs-cli-cache")
const lazyLoad = require("@salesforce/lazy-require").default.create(cacheFile)
lazyLoad.start()
import {run as oclifRun} from "@oclif/command"
import {compileConfig} from "next/dist/server/config-shared"
import {getProjectRoot} from "next/dist/server/lib/utils"

// Load the .env environment variable so it's available for all commands
require("dotenv-expand")(require("dotenv-flow").config({silent: true}))

async function buildConfigIfNeeded() {
  if (["help", "-h", "autocomplete", "new", "s", "start"].includes(process.argv[2])) {
    return Promise.resolve()
  }

  return compileConfig(await getProjectRoot(process.cwd()))
}

function runOclif() {
  return (
    oclifRun()
      .then(require("@oclif/command/flush"))
      // @ts-ignore (TS complains about using `catch`)
      .catch(require("@oclif/errors/handle"))
  )
}

export function run() {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  buildConfigIfNeeded().then(runOclif)
}
