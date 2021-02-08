require("v8-compile-cache")
const cacheFile = require("path").join(__dirname, ".blitzjs-cli-cache")
const lazyLoad = require("@salesforce/lazy-require").default.create(cacheFile)
lazyLoad.start()
import {run as oclifRun} from "@oclif/command"
import moduleAlias from "module-alias"
import {resolveAliases} from "@blitzjs/config"

moduleAlias.addAliases(resolveAliases.node)

// Load the .env environment variable so it's available for all commands
require("dotenv-expand")(require("dotenv-flow").config({silent: true}))

export function run() {
  oclifRun()
    .then(require("@oclif/command/flush"))
    // @ts-ignore (TS complains about using `catch`)
    .catch(require("@oclif/errors/handle"))
}
