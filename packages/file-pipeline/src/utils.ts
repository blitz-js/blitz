import File from 'vinyl'
import {PipelineEvent, EventedFile} from './types'

export function isFile(file: any): file is EventedFile {
  return File.isVinyl(file)
}

export function isEvent(file: any): file is PipelineEvent {
  return typeof file === 'string'
}
