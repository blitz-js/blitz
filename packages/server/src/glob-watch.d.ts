import {SrcOptions} from 'vinyl-fs'

export interface IOptions extends SrcOptions {
  ignored?: string[]
  events?: Array<string>
  base?: string
  name?: string
  verbose?: boolean
  readDelay?: number
}
