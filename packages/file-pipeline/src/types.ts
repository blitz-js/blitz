import {Readable, Writable} from 'stream'
import {FileCache} from './pipeline/helpers/file-cache'

/**
 * Configuration for Rules
 */
export type RuleConfig = {
  src: string
  dest: string
  cwd: string
  include: string[]
  ignore: string[]
  watch: boolean
}

/**
 * Arguments object for Rules
 */
export type RuleArgs = {
  config: RuleConfig
  input: Writable
  bus: Writable
  getInputCache: () => FileCache
}

/**
 * Basic template for Business rules modules
 */
export type Rule = (
  a: RuleArgs,
) => {
  stream: Readable
  ready?: Record<string, any>
} & Record<string, any>
