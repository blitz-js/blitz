const path = require("path")

const {dependencies} = require(`${path.join(process.cwd(), "../blitz")}/package.json`)

//log the dependency version to get in cypress.exec() function output
console.log(dependencies["@blitzjs/cli"])
