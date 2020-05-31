import {Writable} from 'stream'
import File from 'vinyl'
import {pipeline, through} from '../streams'
import {Rule, RuleArgs, RuleConfig} from '../types'
import {agnosticSource} from './helpers/agnostic-source'
import {createEnrichFiles} from './helpers/enrich-files'
import {createFileCache} from './helpers/file-cache'
import {createIdleHandler} from './helpers/idle-handler'
import {createWorkOptimizer} from './helpers/work-optimizer'
import {createWrite} from './helpers/writer'

export function isSourceFile(file: File) {
  return file.hash.indexOf(':') === -1
}

/**
 * Creates a pipeline stream that transforms files.
 * @param config Config object containing basic information for the file pipeline
 * @param rules Array of rules to apply to each file
 * @param errors Stream that takes care of all operational error rendering
 * @param bus Stream to pipe events to
 */
export function createPipeline(config: RuleConfig, rules: Rule[], bus: Writable) {
  // Helper streams don't account for business rules
  const source = agnosticSource(config)
  const input = through({objectMode: true}, (f, _, next) => next(null, f))
  const optimizer = createWorkOptimizer()
  const enrichFiles = createEnrichFiles()
  const srcCache = createFileCache(isSourceFile)
  const idleHandler = createIdleHandler(bus)
  const writer = createWrite(config.dest, bus)

  // Send this DI object to every rule
  const api: RuleArgs = {
    config,
    input,
    bus,
    getInputCache: () => srcCache.cache,
  }

  // Initialize each rule
  const initializedRules = rules.map((rule) => rule(api))

  const stream = pipeline(
    source.stream, // files come from file system
    input, // files coming via internal API

    // Preparing files
    enrichFiles.stream,
    srcCache.stream,
    optimizer.triage,

    // Run business rules
    ...initializedRules.map((rule) => rule.stream),

    // Tidy up
    writer.stream,
    optimizer.reportComplete,

    idleHandler.stream,
  )

  const ready = Object.assign({}, ...initializedRules.map((rule) => rule.ready))

  return {stream, ready}
}
