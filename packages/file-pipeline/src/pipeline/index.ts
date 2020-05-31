import {Writable} from 'stream'
import File from 'vinyl'
import {pipeline, through} from '../streams'
import {Stage, StageArgs, StageConfig} from '../types'
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
 * @param stages Array of stages to apply to each file
 * @param errors Stream that takes care of all operational error rendering
 * @param bus Stream to pipe events to
 */
export function createPipeline(config: StageConfig, stages: Stage[], bus: Writable) {
  // Helper streams don't account for business stages
  const source = agnosticSource(config)
  const input = through({objectMode: true}, (f, _, next) => next(null, f))
  const optimizer = createWorkOptimizer()
  const enrichFiles = createEnrichFiles()
  const srcCache = createFileCache(isSourceFile)
  const idleHandler = createIdleHandler(bus)
  const writer = createWrite(config.dest, bus)

  // Send this object to every stage
  const api: StageArgs = {
    config,
    input,
    bus,
    getInputCache: () => srcCache.cache,
  }

  // Initialize each stage
  const initializedStages = stages.map((stage) => stage(api))

  const stream = pipeline(
    source.stream, // files come from file system
    input, // files coming via internal API

    // Preparing files
    enrichFiles.stream,
    srcCache.stream,
    optimizer.triage,

    // Run business stages
    ...initializedStages.map((stage) => stage.stream),

    // Tidy up
    writer.stream,
    optimizer.reportComplete,

    idleHandler.stream,
  )

  const ready = Object.assign({}, ...initializedStages.map((stage) => stage.ready))

  return {stream, ready}
}
