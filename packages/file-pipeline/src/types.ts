import {Writable} from "stream"
import File from "vinyl"
import {OverrideTriage} from "./helpers/work-optimizer"

export type FileCacheEntry = {path: string}

export type RouteType = "page" | "rpc" | "api"
export type RouteVerb = "get" | "post" | "patch" | "head" | "delete" | "*"
export type RouteCacheEntry = {
  path: string
  uri: string
  verb: string
  type: RouteType
}

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

export interface RouteCacheInterface extends AbstractFileCache {
  delete(file: File): void
  add(file: File): void

  get(): Record<string, RouteCacheEntry>
  get(key: string): RouteCacheEntry
  get(file: File): RouteCacheEntry

  set(key: string, value: RouteCacheEntry): void

  filterByPath: (filterFn: (a: string) => boolean) => RouteCacheEntry[]
  filter: (filterFn: (a: RouteCacheEntry) => boolean) => RouteCacheEntry[]

  toString: () => string
  toArray: () => RouteCacheEntry[]
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
  overrideTriage?: OverrideTriage
}

/**
 * Arguments object for Stages
 */
export type StageArgs = {
  config: StageConfig
  input: Writable
  bus: Writable
  getInputCache: () => FileCacheInterface
  getRouteCache: () => RouteCacheInterface
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
  beforeTriage?: boolean
} & Record<string, any>
