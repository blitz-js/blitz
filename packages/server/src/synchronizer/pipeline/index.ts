import {pipeline, through} from '../streams'
import {RuleConfig, RuleArgs} from '../types'
import {createEnrichFiles} from './helpers/enrich-files'
import {createFileCache} from './helpers/file-cache'
import {createIdleHandler} from './helpers/idle-handler'
import {createWorkOptimizer} from './helpers/work-optimizer'
import {createRuleConfig} from './rules/config'
import {createRuleManifest} from './rules/manifest'
import {createRuleRelative} from './rules/relative'
import {createRulePages} from './rules/pages'
import {createRuleRpc} from './rules/rpc'
import {createRuleWrite} from './rules/write'
import {isSourceFile} from './utils'
import {Writable} from 'stream'

const input = through({objectMode: true}, (f, _, next) => next(null, f))

/**
 * Creates a pipeline stream that transforms files.
 * @param config Config object containing basic information for the file pipeline
 * @param errors Stream that takes care of all operational error rendering
 * @param reporter Stream that takes care of all view rendering
 */
export function createPipeline(config: RuleConfig, errors: Writable, reporter: Writable) {
  // Helper streams don't account for business rules
  const optimizer = createWorkOptimizer()
  const enrichFiles = createEnrichFiles()
  const srcCache = createFileCache(isSourceFile)
  const idleHandler = createIdleHandler(reporter)

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
  const ruleRelative = createRuleRelative(api)
  const ruleWrite = createRuleWrite(api)
  const ruleManifest = createRuleManifest(api)

  const stream = pipeline(
    input,

    // Preparing files
    enrichFiles.stream,
    srcCache.stream,
    optimizer.triage,

    // Run business rules
    ruleRelative.stream,
    rulePages.stream,
    ruleRpc.stream,
    ruleConfig.stream,
    ruleWrite.stream,

    // Tidy up
    optimizer.reportComplete,

    // TODO: try and move this up to business rules section
    ruleManifest.stream,

    idleHandler.stream,
  )

  return {stream, manifest: ruleManifest.manifest}
}
