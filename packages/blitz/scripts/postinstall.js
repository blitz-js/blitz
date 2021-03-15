#!/usr/bin/env node
const spawn = require("cross-spawn")

function cliBin() {
  return require.resolve("../cli/dist/blitz-cli.cjs")
}

/**
 * @param {string[]} args
 */
function runBlitzCommand(...args) {
  return spawn.sync("node", [cliBin(), ...args], {cwd: process.env.INIT_CWD})
}

function dxGenerate() {
  const result = runBlitzCommand("dx-generate")
  return result.status === 0
}

function isCliAlreadyGenerated() {
  try {
    cliBin()
    return true
  } catch (error) {
    return false
  }
}

function isInstalledAsAPackage() {
  return isCliAlreadyGenerated()
}

function main() {
  if (!isInstalledAsAPackage()) {
    return
  }

  dxGenerate()
}

main()
