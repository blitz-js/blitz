// Startup script for Phusion Passenger that uses next.js cli
// Run `blitz build` before starting
const path = require("path")

const blitzPath = path.join(__dirname, "node_modules", "blitz", "bin", "blitz")

process.argv.length = 1
process.argv.push(blitzPath, "start")

require(blitzPath)
