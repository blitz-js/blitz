import {Stream} from 'stream'

import pipe from 'pump'
export {pipe}

import through from 'through2'
export {through}

export {default as parallel} from 'parallel-transform'

export {default as from} from 'from2'

import pumpify from 'pumpify'

// Bad types
type PumpifyFn = (...streams: Stream[]) => pumpify
// const pipeline = (pumpifyFn as any) as PumpifyFn & {obj: PumpifyFn}
const pipeline = (pumpify.ctor({
  autoDestroy: false,
  destroy: false,
  objectMode: true,
  highWaterMark: 160,
}) as any) as PumpifyFn

export {pipeline}
