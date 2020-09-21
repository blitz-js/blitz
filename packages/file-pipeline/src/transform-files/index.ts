import {Transform} from "stream"
import {createDisplay} from "../display"
import {ERROR_THROWN, READY} from "../events"
import {createPipeline} from "../pipeline"
import {pipe, through} from "../streams"
import {Stage} from "../types"

type FSStreamer = {stream: NodeJS.ReadWriteStream}

type SynchronizeFilesOptions = {
  ignore?: string[]
  include?: string[]
  watch?: boolean
  bus?: Transform
  source?: FSStreamer
  writer?: FSStreamer
  noclean?: boolean
}

const defaultBus = through.obj()

/**
 * Assembles a file stranform pipeline to convert blitz source code to something that
 * can run in NextJS.
 * @param config Configuration object
 */
export async function transformFiles(
  src: string,
  stages: Stage[],
  dest: string,
  options: SynchronizeFilesOptions,
): Promise<any> {
  const {
    // default options
    ignore = [],
    include = [],
    watch = false,
    bus = defaultBus,
    source,
    writer,
    // noclean = false,
  } = options

  // HACK: cleaning the dev folder on every restart means we do more work than necessary
  // TODO: remove this clean and devise a way to resolve differences in stream
  // if (!noclean) await clean(dest)

  // const errors = createErrorsStream(reporter.stream)
  const display = createDisplay()
  return await new Promise((resolve, reject) => {
    const config = {
      cwd: src,
      src,
      dest,
      include,
      ignore,
      watch,
    }
    const fileTransformPipeline = createPipeline(config, stages, bus, source, writer)

    bus.on("data", ({type}) => {
      if (type === READY) {
        resolve(fileTransformPipeline.ready)
      }
    })

    // Send source to fileTransformPipeline
    fileTransformPipeline.stream.on("error", (err) => {
      bus.write({type: ERROR_THROWN, payload: err})
      if (err) reject(err)
    })

    // Send reporter events to display
    pipe(bus, display.stream, (err) => {
      if (err) reject(err)
    })
  })
}
