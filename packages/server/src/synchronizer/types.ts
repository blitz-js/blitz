import {Readable, Writable} from 'stream'
import {FileCache} from './pipeline/helpers/file-cache'

/**
 * Configuration for Rules
 */
export type RuleConfig = {
  src: string
  dest: string
  cwd: string
  isTsProject: boolean
  manifest: {
    path: string
    write: boolean
  }
}

/**
 * Arguments object for Rules
 */
export type RuleArgs = {
  config: RuleConfig
  input: Writable
  reporter: Writable
  errors: Writable
  getInputCache: () => FileCache
}

/**
 * Basic template for Business rules modules
 */
export type Rule = (
  a: RuleArgs,
) => {
  stream: Readable
} & Record<any, any>
