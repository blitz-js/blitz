import File from 'vinyl'
import {through, pipeline} from '../../../streams'
import {dest} from 'vinyl-fs'
import gulpIf from 'gulp-if'
import {resolve} from 'path'
import {Rule} from '../../../types'

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

const setManifestEntry = (manifest: Manifest) => {
  const stream = through({objectMode: true}, (file: File, _, next) => {
    const [origin] = file.history
    const dest = file.path
    if (file.event === 'add' || file.event === 'change') {
      manifest.setEntry(origin, dest)
    }

    if (file.event === 'unlink' || file.event === 'unlinkDir') {
      manifest.removeKey(origin)
    }

    next(null, file)
  })
  return {stream}
}

const createManifestFile = (manifest: Manifest, fileName: string, compact: boolean = false) => {
  const stream = through({objectMode: true}, (_, __, next) => {
    const manifestFile = new File({
      path: fileName,
      contents: Buffer.from(manifest.toJson(compact)),
    })

    next(null, manifestFile)
  })
  return {stream}
}

/**
 * Returns a rule to create and write the file error manifest so we can
 * link to the correct files on a NextJS browser error.
 */
// TODO: Offload the file writing to later and write with all the other file writing
export const createRuleManifest: Rule = ({config}) => {
  const manifest = Manifest.create()
  const stream = pipeline(
    setManifestEntry(manifest).stream,
    createManifestFile(manifest, resolve(config.cwd, config.manifest.path)).stream,
    gulpIf(config.manifest.write, dest(config.src)),
  )

  return {stream, manifest}
}
