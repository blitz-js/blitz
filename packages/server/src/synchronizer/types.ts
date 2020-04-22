import {Manifest} from './pipeline/rules/manifest'
import {through} from './streams'
import {Readable, Writable} from 'stream'
import {FileCache} from './pipeline/helpers/file-cache'

export type PhaseNames = keyof RuleTransformObject

type RuleTransformObject = {
  input: ReturnType<typeof through>
  analyze: ReturnType<typeof through>
  process: ReturnType<typeof through>
  write: ReturnType<typeof through>
  complete: ReturnType<typeof through>
}

export type ReadyObj = {
  manifest: Manifest
}

export type RuleArgs = {
  config: RuleConfig
  input: Writable
  reporter: Writable
  errors: Writable
  getInputCache: () => FileCache
}

export type ReadyFn = (obj: ReadyObj) => void
export type ReadyArg = ReadyObj | ReadyFn

export type Rule = (
  a: RuleArgs,
) => {
  stream: Readable
} & Record<any, any>

export type RuleInitializer = any

export type RuleConfig = {
  src: string
  dest: string
  cwd: string
  manifest: {
    path: string
    write: boolean
  }
}
