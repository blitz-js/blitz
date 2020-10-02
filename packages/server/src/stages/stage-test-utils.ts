import {FileCache} from "@blitzjs/file-pipeline"
import {StageArgs, StageConfig} from "@blitzjs/file-pipeline/dist/packages/file-pipeline/src/types"
import {pipeline, through} from "../streams"

export function mockStageArgs(a: {entries?: string[]; cwd?: string}): StageArgs {
  const config: StageConfig = {
    dest: "",
    cwd: a.cwd || "",
    ignore: [],
    include: [],
    src: "",
    watch: false,
  }
  return {
    getInputCache() {
      return ({
        toPaths() {
          return a.entries || []
        },
      } as any) as FileCache
    },
    bus: through.obj(),
    input: through.obj(),
    config,
    processNewFile: () => {},
    processNewChildFile: () => {},
  }
}

const defaultLogger = (file: any) => (typeof file === "string" ? file : file.path)
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
