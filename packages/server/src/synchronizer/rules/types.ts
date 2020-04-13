import File from 'vinyl'
import {Readable, Transform} from 'readable-stream'

// Rule functions take a readable stream and return a new stream
// Typically they should pipe the output to a FileTransform stream
export type Rule = (stream: Readable) => Readable | Transform

// File Transforms are used in conjunction with fileTransformer
// If the function returns an array of files add those files to the stream
// If you return an empty array the input file will be deleted from the stream
export type FileTransform = (file: File, encoding?: string) => File | File[]
