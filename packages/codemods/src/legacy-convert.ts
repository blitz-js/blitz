import j from "jscodeshift"
import * as fs from "fs-extra"
import path from "path"

const legacyConvert = async () => {
  let isTypescript = fs.existsSync(path.resolve("tsconfig.json"))
  let blitzConfigFile = `blitz.config.${isTypescript ? "ts" : "js"}`
  let isLegacyBlitz = fs.existsSync(path.resolve(blitzConfigFile))
  let failedAt =
    fs.existsSync(path.resolve(".migration.json")) && fs.readJSONSync("./.migration.json").failedAt

  let steps: {
    name: string
    action: () => void
  }[] = []

  // Add steps in order
  steps.push({
    name: "Rename blitz.config to next.config",
    action: () => fs.renameSync(blitzConfigFile, "next.config.js"),
  })

  steps.push({
    name: "Error",
    action: () => {
      throw new Error("Test")
    },
  })

  // Loop through steps and run the action
  if (isLegacyBlitz) {
    for (let [index, step] of steps.entries()) {
      // Ignore previous steps and continue at step that was failed
      if (failedAt && index + 1 !== failedAt) {
        continue
      }
      console.log(`Running ${step.name}...`)
      try {
        step.action()
      } catch (err) {
        console.log(`ERROR: ${err}`)
        failedAt = index + 1
        fs.writeJsonSync(".migration.json", {
          failedAt,
        })
        process.exit(1)
      }
      console.log(`Successfully ran ${step.name}`)
    }
  } else {
    console.log("Legacy blitz config file not found")
  }
}

export {legacyConvert}
