#!/usr/bin/env node
const spawn = require("cross-spawn")

/**
 * @param {string[]} args
 */
function runBlitzCommand(...args) {
  const cliBin = require.resolve("../cli/dist/blitz-cli.cjs")
  return spawn.sync("node", [cliBin, ...args], {cwd: process.env.INIT_CWD})
}

function dxGenerate() {
  const result = runBlitzCommand("dx-generate")
  return result.status === 0
}

function main() {
  dxGenerate()
}

main()
