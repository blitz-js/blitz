import {resolve} from 'path'
import {ServerConfig, normalize} from './config'
import {nextStartDev} from './next-utils'
import {configureRules} from './rules'

export async function dev(
  {watch = true, ...config}: ServerConfig,
  readyForNextDev: Promise<any> = Promise.resolve(),
) {
  const {
    //
    rootFolder,
    transformFiles,
    nextBin,
    devFolder,
    ignore,
    include,
    ...rulesConfig
  } = await normalize({
    ...config,
    interceptNextErrors: true,
  })

  const src = resolve(rootFolder)
  const rules = configureRules(rulesConfig)
  const dest = resolve(rootFolder, devFolder)
  const options = {
    ignore,
    include,
    watch,
  }

  const [{manifest}] = await Promise.all([
    transformFiles(src, rules, dest, options),
    // Ensure next does not start until parallel processing completes
    readyForNextDev,
  ])

  await nextStartDev(nextBin, dest, manifest, devFolder, config)
}
