import {Writable} from "stream"
import File from "vinyl"
import {FileCache} from "./helpers/file-cache"

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
  getInputCache: () => FileCache
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
