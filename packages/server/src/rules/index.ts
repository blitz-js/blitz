import {createRuleRelative} from './relative'
import {createRulePages} from './pages'
import {createRuleRpc} from './rpc'
import {createRuleConfig} from './config'
import {createRuleManifest} from './manifest'

export const configureRules = (config: {writeManifestFile: boolean}) => [
  // Order is important
  createRuleRelative,
  createRulePages,
  createRuleRpc,
  createRuleConfig,
  createRuleManifest(config.writeManifestFile),
]
