import {createStageRelative} from './relative'
import {createStagePages} from './pages'
import {createStageRpc} from './rpc'
import {createStageConfig} from './config'
import {createStageManifest} from './manifest'

// These create pipeline stages that are run as the business rules for Blitz
// Read this folders README for more information
export const configureStages = (config: {writeManifestFile: boolean}) => [
  // Order is important
  createStageRelative,
  createStagePages,
  createStageRpc,
  createStageConfig,
  createStageManifest(config.writeManifestFile),
]
