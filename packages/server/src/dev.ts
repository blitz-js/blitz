import {resolve} from 'path'
import {synchronizeFiles} from './synchronizer'
import {Config, enhance} from './config'
import {nextStartDev} from './next-utils'

export async function dev(config: Config) {
  const {rootFolder, nextBin, devFolder} = enhance({...config, interceptNextErrors: true})
  const src = resolve(rootFolder)
  const dest = resolve(rootFolder, devFolder)

  const fileWatcher = await synchronizeFiles({
    src,
    dest,
    watch: true,
  })

  nextStartDev(nextBin, dest)

  return fileWatcher
}
