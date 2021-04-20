const fs = require("fs-extra")
const cpx = require("@juanm04/cpx")

cpx.copy("README.md", "packages/blitz/")

// # Rename nextjs package so we can publish as @blitzjs/next
// sed -i '' 's/name\": \"next\"/name\": \"@blitzjs\/next\"/' nextjs/packages/next/package.json
//
// # Also change next dependency name in blitz core
// sed -i '' 's/next\": \"/next\": \"npm:@blitzjs\/next@/' packages/core/package.json

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
