import {createStageRelative} from './relative'
import {createStagePages} from './pages'
import {createStageRpc} from './rpc'
import {createStageConfig} from './config'
import {createStageManifest} from './manifest'

export const configureStages = (config: {writeManifestFile: boolean}) => [
  // Order is important
  createStageRelative,
  createStagePages,
  createStageRpc,
  createStageConfig,
  createStageManifest(config.writeManifestFile),
]
