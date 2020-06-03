import {through} from './streams'

import {isEvent} from './utils'
import {EventedFile, PipelineItem} from './types'
import {DuplexOptions, Transform} from 'stream'

/**
 * Stream API for utilizing stream functions
 *
 * @param push Function for pushing pipeline items to the stream
 * @param next Function for passing errors or pushing pipeline items to the stream and then triggering the next ingestion
 */
type StreamApi = {
  push: (item: PipelineItem) => boolean
  next: (err?: Error | null | undefined, item?: PipelineItem) => void
}

type PossibleTransformFnReturn = PipelineItem | void | Error

type PossiblePromise<T> = T | Promise<T>

/**
 * TransformFn
 *
 * @argument file Pipeline item to process
 * @argument api StreamApi to manage the stream
 * @returns A promise with either a Pipelineitem, an error or undefined. If a PipelineItem is returned it will be sent on. If an Error is returned it will throw an Error on the stream. If undefined is returned nothing will happen and you need to remember to call next() to process the next chunk.
 */
export type TransformFn = (file: PipelineItem, api: StreamApi) => PossiblePromise<PossibleTransformFnReturn>

/**
 * TransformFn
 *
 * @argument file An EventedFile to process
 * @argument api StreamApi to manage the stream
 * @returns A promise with either a Pipelineitem, an error or undefined. If a PipelineItem is returned it will be sent on. If an Error is returned it will throw an Error on the stream. If undefined is returned nothing will happen and you need to remember to call next() to process the next chunk.
 */
export type TransformFilesFn = (
  file: EventedFile,
  api: StreamApi,
) => PossiblePromise<PossibleTransformFnReturn>

const defaultStreamOptions = {
  objectMode: true,
}

const defaultTransformFn = (f: any) => f

export function transform(
  transformFn: TransformFn = defaultTransformFn,
  options: DuplexOptions = defaultStreamOptions,
) {
  const mergedOpts = Object.assign(defaultStreamOptions, options)
  return through(mergedOpts, async function (item: PipelineItem, _, next: StreamApi['next']) {
    processInput({transformFn, next, self: this, item})
  })
}

transform.file = function transformFiles(
  transformFn: TransformFilesFn = defaultTransformFn,
  options: DuplexOptions = defaultStreamOptions,
) {
  const mergedOpts = Object.assign(defaultStreamOptions, options)
  return through(mergedOpts, async function (item: PipelineItem, _, next: StreamApi['next']) {
    processInput({transformFn, next, self: this, filesOnly: true, item})
  })
}

async function processInput({
  transformFn,
  next,
  self,
  filesOnly,
  item,
}: {
  transformFn: TransformFilesFn | TransformFn
  next: StreamApi['next']
  self: Transform
  filesOnly?: boolean
  item: PipelineItem
}) {
  const push = self.push.bind(self)

  // Forward events without running transformFn
  if (filesOnly && isEvent(item)) return next(null, item)

  const transformed = await Promise.resolve(
    transformFn(item as EventedFile, {
      push,
      next,
    }),
  )

  if (transformed instanceof Error) {
    return next(transformed)
  }

  if (transformed) {
    next(null, transformed)
  }
}
