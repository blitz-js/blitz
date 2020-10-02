import {Writable} from "stream"
import File from "vinyl"
import {pipeline, through} from "./streams"
import {Stage, StageArgs, StageConfig, EventedFile} from "./types"
import {agnosticSource} from "./helpers/agnostic-source"
import {createEnrichFiles} from "./helpers/enrich-files"
import {createFileCache, FileCache} from "./helpers/file-cache"
import {createIdleHandler} from "./helpers/idle-handler"
import {createWorkOptimizer} from "./helpers/work-optimizer"
import {createWrite} from "./helpers/writer"
import {Stats} from "fs"
export function isSourceFile(file: File) {
  return file.hash?.indexOf(":") === -1
}

function createStageArgs(
  config: StageConfig,
  input: Writable,
  bus: Writable,
  cache: FileCache,
): StageArgs {
  const getInputCache = () => cache

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
  const optimizer = createWorkOptimizer(config.src, config.dest)
  const enrichFiles = createEnrichFiles()
  const srcCache = createFileCache(isSourceFile)
  const idleHandler = createIdleHandler(bus)

  // Send this object to every stage
  const api = createStageArgs(config, input, bus, srcCache.cache)

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
