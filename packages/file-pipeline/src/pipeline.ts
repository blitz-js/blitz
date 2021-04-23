import {Stats} from "fs"
import micromatch from "micromatch"
import {Writable} from "stream"
import File from "vinyl"
import {agnosticSource} from "./helpers/agnostic-source"
import {createEnrichFiles} from "./helpers/enrich-files"
import {createFileCache, FileCache} from "./helpers/file-cache"
import {createIdleHandler} from "./helpers/idle-handler"
import {createRouteCache, RouteCache} from "./helpers/route-cache"
import {createWorkOptimizer} from "./helpers/work-optimizer"
import {createWrite} from "./helpers/writer"
import {pipeline, through} from "./streams"
import {EventedFile, Stage, StageArgs, StageConfig} from "./types"

export function isSourceFile(file: File) {
  return file.hash?.indexOf(":") === -1
}

export function isPageFile(file: File) {
  return file.path
}

function createStageArgs(
  config: StageConfig,
  input: Writable,
  bus: Writable,
  fileCache: FileCache,
  routeCache: RouteCache,
): StageArgs {
  const getInputCache = () => fileCache
  const getRouteCache = () => routeCache

  function processNewFile(file: File) {
    if (!file.stat) {
      // Add a stats here so we can then generate a new ID
      // during enrichment
      const stat = new Stats()
      file.stat = stat
      file.event = "add"
    }
    input.write(file)
  }

  function processNewChildFile({
    parent,
    child,
    stageId,
    subfileId,
  }: {
    parent: EventedFile
    child: File
    stageId: string
    subfileId: string
  }) {
    child.hash = [parent.hash, stageId, subfileId].join("|")

    processNewFile(child)
  }

  return {
    config,
    input,
    bus,
    getInputCache,
    getRouteCache,
    processNewFile,
    processNewChildFile,
  }
}

/**
 * Creates a pipeline stream that transforms files.
 * @param config Config object containing basic information for the file pipeline
 * @param stages Array of stages to apply to each file
 * @param errors Stream that takes care of all operational error rendering
 * @param bus Stream to pipe events to
 */
export function createPipeline(
  config: StageConfig,
  stages: Stage[],
  bus: Writable,
  // Initialise source and writer here so we can inject them in testing
  source: {stream: NodeJS.ReadWriteStream} = agnosticSource(config),
  writer: {stream: NodeJS.ReadWriteStream} = createWrite(config.dest, bus),
) {
  // Helper streams don't account for business stages
  const input = through.obj()
  const optimizer = createWorkOptimizer(config.src, config.dest, config.overrideTriage)
  const enrichFiles = createEnrichFiles()
  const srcCache = createFileCache(isSourceFile)
  const routeCache = createRouteCache()
  const idleHandler = createIdleHandler(bus)

  // Send this object to every stage
  const api = createStageArgs(config, input, bus, srcCache.cache, routeCache.cache)

  // Initialize each stage
  const initializedStages = stages.map((stage) => stage(api))

  // Discard git ignored files
  const ignorer = through.obj((file, _, next) => {
    if (file && file.path) {
      const match = micromatch.isMatch(file.path, config.ignore)
      if (match) {
        return next() // skip chunk
      }
    }
    next(null, file)
  })

  const stream = pipeline(
    source.stream, // files come from file system
    input, // files coming via internal API

    // Preparing files
    enrichFiles.stream,
    srcCache.stream,
    optimizer.triage,

    // Filter files
    ignorer,

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
