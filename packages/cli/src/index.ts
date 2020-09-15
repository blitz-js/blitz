require("v8-compile-cache")
const lazyLoad = require("@salesforce/lazy-require").default.create(".blitz-cli-cache")
lazyLoad.start()
import {run as oclifRun} from "@oclif/command"

// Load the .env environment variable so it's available for all commands
require("dotenv-expand")(require("dotenv-flow").config({silent: true}))

export function run() {
  oclifRun()
    .then(require("@oclif/command/flush"))
    // @ts-ignore (TS complains about using `catch`)
    .catch(require("@oclif/errors/handle"))
}
