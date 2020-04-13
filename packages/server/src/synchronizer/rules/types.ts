import File from 'vinyl'
import {Readable, Writable, Transform} from 'readable-stream'

// Rule functions transform the file stream
// If the function returns an array of files add those files to the stream
// If you return an empty array the input file will be deleted from the stream
export type FileTransform = (file: File, encoding?: string) => File | File[]
export type StreamDecorator = (stream: Readable | Writable) => Readable

// export type Rule = {
//   transform: FileTransform
//   init: StreamDecorator
// }

export type Rule = (stream: Readable) => Transform
