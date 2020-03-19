import through2 from 'through2'
import File from 'vinyl'

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

export const setManifestEntry = (manifest: Manifest) =>
  through2.obj((file, _, done) => {
    const [origin] = file.history
    const dest = file.path

    if (file.event === 'add' || file.event === 'change') {
      manifest.setEntry(origin, dest)
    }

    if (file.event === 'unlink' || file.event === 'unlinkDir') {
      manifest.removeKey(origin)
    }

    done(null, file)
  })

export const createManifestFile = (manifest: Manifest, fileName: string, compact: boolean = false) =>
  through2.obj((_, __, done) => {
    const manifestFile = new File({
      path: fileName,
      contents: Buffer.from(manifest.toJson(compact)),
    })

    done(null, manifestFile)
  })
