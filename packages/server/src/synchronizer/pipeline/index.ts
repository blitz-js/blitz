import {pipeline, through} from '../streams'
import {RuleConfig, RuleArgs} from '../types'
import createFileEnricher from './helpers/enrich-files'
import createFileCache from './helpers/file-cache'
import createReadyHandler from './helpers/ready-handler'
import createWorkOptimizer from './helpers/work-optimizer'
import createRuleConfig from './rules/config'
import createRuleManifest from './rules/manifest'
import createRulePages from './rules/pages'
import createRuleRpc from './rules/rpc'
import createRuleWrite from './rules/write'
import {isSourceFile} from './utils'
import {Writable} from 'stream'

const input = through({objectMode: true}, (f, _, next) => next(null, f))

/**
 * Creates a pipeline stream that transforms files.
 * @param config Config object containing basic information for the file pipeline
 * @param ready Ready handlerto run when ready event is fired
 * @param errors Stream that takes care of all operational error rendering
 * @param reporter Stream that takes care of all view rendering
 */
export default function createPipeline(
  config: RuleConfig,
  ready: () => void,
  errors: Writable,
  reporter: Writable,
) {
  // Helper streams don't account for business rules
  const optimizer = createWorkOptimizer()
  const enrichFiles = createFileEnricher()
  const srcCache = createFileCache(isSourceFile)
  const readyHandler = createReadyHandler(ready)

  // Send this DI object to every rule
  const api: RuleArgs = {
    config,
    input,
    reporter,
    errors,
    getInputCache: () => srcCache.cache,
  }

  // Rules represent business rules
  // Perhaps if it makes sense we can iterate over rules passed in
  const rulePages = createRulePages(api)
  const ruleRpc = createRuleRpc(api)
  const ruleConfig = createRuleConfig(api)
  const ruleWrite = createRuleWrite(api)
  const ruleManifest = createRuleManifest(api)

  const stream = pipeline(
    input,

    // Preparing files
    enrichFiles.stream,
    srcCache.stream,
    optimizer.triage,

    // Run business rules
    rulePages.stream,
    ruleRpc.stream,
    ruleConfig.stream,
    ruleWrite.stream,

    // Tidy up
    optimizer.reportComplete,

    // TODO: try and move this up to business rules section
    ruleManifest.stream,

    readyHandler.stream,
  )

  return {stream, manifest: ruleManifest.manifest}
}
