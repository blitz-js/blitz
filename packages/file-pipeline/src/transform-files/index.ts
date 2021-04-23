import {join} from "path"
import {Transform} from "stream"
import {createDisplay} from "../display"
import {ERROR_THROWN, READY} from "../events"
import {rimraf} from "../helpers/rimraf-promise"
import {OverrideTriage} from "../helpers/work-optimizer"
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
  clean?: boolean
  overrideTriage?: OverrideTriage
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
    clean: requestClean,
    overrideTriage,
  } = options

  if (requestClean) await rimraf(dest, {glob: false})
  // Fix windows EPERM issues
  if (process.platform === "win32") await rimraf(join(dest, ".next"), {glob: false})

  const display = createDisplay()
  return await new Promise((resolve, reject) => {
    const fileTransformPipeline = createPipeline(
      {
        cwd: src,
        src,
        dest,
        include,
        ignore,
        watch,
        overrideTriage,
      },
      stages,
      bus,
      source,
      writer,
    )

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
