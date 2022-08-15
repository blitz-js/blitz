import {generateManifest} from "../routes-manifest"
import {log} from "../../../logging"

import {generatePrismaClient} from "./generatePrisma"
import {patchNextSuspenseBug, patchNextConfigWarning} from "./patchNextJs"

const _tryCatch = async (fn: () => Promise<unknown>) => {
  try {
    await fn()
  } catch (err) {
    log.error(JSON.stringify(err, null, 2))
  }
}

export const codegenTasks = async () => {
  await _tryCatch(patchNextSuspenseBug)
  await _tryCatch(patchNextConfigWarning)

  await _tryCatch(async () => {
    await generateManifest()
    log.success("Routes manifest was successfully generated")
  })

  await _tryCatch(generatePrismaClient)
}
