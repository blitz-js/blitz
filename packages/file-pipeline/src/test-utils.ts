import {pipeline, through} from "./streams"

const defaultLogger = (file: any) => (typeof file === "string" ? file : file.path)

// Test expected log items
export function testStreamItems(
  stream: NodeJS.ReadWriteStream,
  expected: any[],
  logger: (a: any) => any = defaultLogger,
) {
  return new Promise<void>((done) => {
    const log: string[] = []

    const st = pipeline(
      stream,
      through.obj((item, _, next) => {
        log.push(logger(item))
        if (log.length === expected.length) {
          expect(log).toEqual(expected)
          st.end()
          setImmediate(() => {
            done()
          })
        }
        next(null, item)
      }),
    )
  })
}

export function take<T>(stream: NodeJS.ReadWriteStream, num: number): Promise<T[]> {
  return new Promise((done) => {
    let items: T[] = []
    const st = pipeline(
      stream,
      through.obj((item, _, next) => {
        items.push(item)
        if (items.length === num) {
          st.end()
          setImmediate(() => {
            done(items)
          })
        }
        next(null, item)
      }),
    )
  })
}
