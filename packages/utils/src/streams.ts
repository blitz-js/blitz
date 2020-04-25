import {Stream} from 'stream'
import pipe from 'pump'
import through from 'through2'
import parallel from 'parallel-transform'
import from from 'from2'
import pumpify from 'pumpify'

type PumpifyFn = (...streams: Stream[]) => pumpify

const pipeline = (pumpify.ctor({
  autoDestroy: false,
  destroy: false,
  objectMode: true,
  highWaterMark: 160,
}) as any) as PumpifyFn

export const streams = {pipe, through, parallel, from, pipeline}
