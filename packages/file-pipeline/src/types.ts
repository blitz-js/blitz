import {Writable} from "stream"
import File from "vinyl"

export type FileCacheEntry = {path: string}

abstract class AbstractFileCache {
  static create: () => AbstractFileCache
}
export interface FileCacheInterface extends AbstractFileCache {
  delete(file: File): void
  add(file: File): void

  filterByPath: (filterFn: (a: string) => boolean) => FileCacheEntry[]
  filter: (filterFn: (a: FileCacheEntry) => boolean) => FileCacheEntry[]
  toString: () => string
  toPaths: () => string[]
}

export type EventedFile = {
  event: "add" | "change" | "unlink" | "unlinkDir"
  hash: string
} & File

export type PipelineEvent = string

export type PipelineItem = File | EventedFile | PipelineEvent

/**
 * Configuration for Stages
 */
export type StageConfig = {
  src: string
  dest: string
  cwd: string
  include: string[]
  ignore: string[]
  watch: boolean
}

/**
 * Arguments object for Stages
 */
export type StageArgs = {
  config: StageConfig
  input: Writable
  bus: Writable
  getInputCache: () => FileCacheInterface
  processNewFile: (file: File) => void
  processNewChildFile: (a: {
    parent: EventedFile
    child: File
    stageId: string
    subfileId: string
  }) => void
}

/**
 * Basic template for Pipeline Stages modules
 */
export type Stage = (
  a: StageArgs,
) => {
  stream: NodeJS.ReadWriteStream
  ready?: Record<string, any>
} & Record<string, any>
