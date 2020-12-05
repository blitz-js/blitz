#!/usr/bin/env node

const glob = require("glob")
const fs = require("fs")

glob("./.next/static/chunks/**/*", {nodir: true}, (err, matches) => {
  if (err) {
    throw err
  }

  const offenders = []

  for (const match of matches) {
    const content = fs.readFileSync(match).toString()

    if (content.includes("this line should not be included in the frontend bundle")) {
      offenders.push(match)
    }
  }

  if (offenders.length > 0) {
    console.error(`tree-shaking failed: ${offenders} includes the forbidden words.`)
    process.exit(1)
  }
})
