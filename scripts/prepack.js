const fs = require("fs-extra")
const cpx = require("@juanm04/cpx")

cpx.copy("README.md", "packages/blitz/")

const nextJsonPath = "nextjs/packages/next/package.json"
const nextJson = fs.readJSONSync(nextJsonPath)
nextJson.name = "@blitzjs/next"
nextJson.blitzVersion = nextJson.version
nextJson.version = `${nextJson.nextjsVersion}-${nextJson.blitzVersion}`
fs.writeJSONSync(nextJsonPath, nextJson, {spaces: 2})

const blitzCoreJsonPath = "packages/core/package.json"
const blitzCoreJson = fs.readJSONSync(blitzCoreJsonPath)
blitzCoreJson.dependencies.next = `npm:@blitzjs/next@${nextJson.version}`
fs.writeJSONSync(blitzCoreJsonPath, blitzCoreJson, {spaces: 2})
