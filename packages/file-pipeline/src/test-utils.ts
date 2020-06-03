import {through, pipeline} from './streams'

const defaultLogger = (file: any) => (typeof file === 'string' ? file : file.path)
export function testStreamItems(
  stream: NodeJS.ReadWriteStream,
  expected: any[],
  logger: (a: any) => any = defaultLogger,
) {
  return new Promise((done) => {
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
