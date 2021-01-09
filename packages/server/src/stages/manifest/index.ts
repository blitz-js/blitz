import {PipelineItem, Stage, transform} from "@blitzjs/file-pipeline"
import debounce from "lodash/debounce"
import File from "vinyl"

type ManifestVO = {
  keys: {[k: string]: string}
  values: {[k: string]: string}
}

export class Manifest {
  private keys: {[k: string]: string} = {}
  private values: {[k: string]: string} = {}
  private events: string[] = []

  constructor(obj?: ManifestVO) {
    if (obj) {
      this.keys = obj.keys
      this.values = obj.values
    }
  }

  getByKey(key: string) {
    return this.keys[key]
  }

  getByValue(value: string) {
    return this.values[value]
  }

  setEntry(key: string, dest: string) {
    this.keys[key] = dest
    this.values[dest] = key
    this.events.push(`set:${dest}`)
  }

  removeKey(key: string) {
    const dest = this.getByKey(key)
    if (!dest) {
      throw new Error(`Key "${key}" returns`)
    }
    delete this.values[dest]
    delete this.keys[key]
    this.events.push(`del:${key}`)
    return dest
  }

  getEvents() {
    return this.events
  }

  toJson(compact = false) {
    return JSON.stringify(this.toObject(), null, compact ? undefined : 2)
  }

  toObject() {
    return {
      keys: this.keys,
      values: this.values,
    }
  }

  static create(obj?: ManifestVO) {
    return new Manifest(obj)
  }
}

/**
 * Returns a stage to create and write the file error manifest so we can
 * link to the correct files on a NextJS browser error.
 */
export const createStageManifest = (
  writeManifestFile: boolean = true,
  manifestPath: string = "_manifest.json",
) => {
  const stage: Stage = () => {
    const manifest = Manifest.create()

    const debouncePushItem = debounce((push: (item: PipelineItem) => void, file: PipelineItem) => {
      push(file)
    }, 500)

    const stream = transform.file((file, {next, push}) => {
      push(file) // Send file on through to be written

      const [origin] = file.history
      const dest = file.path

      if (file.event === "add" || file.event === "change") {
        manifest.setEntry(origin, dest)
      }

      if (file.event === "unlink" || file.event === "unlinkDir") {
        manifest.removeKey(origin)
      }

      if (writeManifestFile) {
        debouncePushItem(
          push,
          new File({
            // NOTE:  no need to for hash because this is a manifest
            //        and doesn't count as work
            path: manifestPath,
            contents: Buffer.from(manifest.toJson(false)),
          }),
        )
      }
      next()
    })

    return {stream, ready: {manifest}}
  }
  return stage
}
