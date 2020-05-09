#!/usr/bin/env node

const fs = require('fs')
const yarnOut = fs.readFileSync(0, {encoding: 'utf8'})

const [installTimeString] = /(?<=^Done in )\d+\.\d+(?=s\.$)/m.exec(yarnOut)
const installTime = Number(installTimeString)

console.log(`Install time: ${installTime}s`)

if (installTime < 30) {
  console.log("We're below 30 secs. That's awesome!")
} else if (installTime < 50) {
  console.log("We're below 50 secs. That's fine!")
} else {
  console.log("We're above 50 secs. That's not great!")
  process.exit(1)
}
