// The following are a loose collaction of stream
// helpers based on the missisippi library

import {Stream} from 'stream'

import pipe from 'pump'
export {pipe}

import through from 'through2'
export {through}

export {default as parallel} from 'parallel-transform'

// Fix issues with interop
import from2 from 'from2'
type From2 = typeof from2
const from: From2 = require('from2')
export {from}

// Fix issues with interop
import flushWriteStream from 'flush-write-stream'
type FlushWriteStream = typeof flushWriteStream
const to: FlushWriteStream = require('flush-write-stream')
export {to}

import pumpify from 'pumpify'

// Bad types
type PumpifyFn = (...streams: Stream[]) => pumpify
// const pipeline = (pumpifyFn as any) as PumpifyFn & {obj: PumpifyFn}
const pipeline = (pumpify.ctor({
  autoDestroy: false,
  destroy: false,
  objectMode: true,
  highWaterMark: 10000,
}) as any) as PumpifyFn

export {pipeline}
