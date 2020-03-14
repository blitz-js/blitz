import through2 from 'through2'
import File from 'vinyl'

export class Manifest {
  private key: {[k: string]: string} = {}
  private inverse: {[k: string]: string} = {}
  private events: string[] = []

  getByKey(key: string) {
    return this.key[key]
  }

  getByValue(value: string) {
    return this.inverse[value]
  }

  setEntry(key: string, dest: string) {
    this.key[key] = dest
    this.inverse[dest] = key
    this.events.push(`set:${dest}`)
  }

  removeKey(key: string) {
    const dest = this.getByKey(key)
    if (!dest) {
      throw new Error(`Key "${key}" returns`)
    }
    delete this.inverse[dest]
    delete this.key[key]
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
      keys: this.key,
      values: this.inverse,
    }
  }

  static create() {
    return new Manifest()
  }
}

export const toManifestFile = (manifest: Manifest, fileName: string, compact: boolean = false) =>
  through2.obj((file, _, done) => {
    const [origin] = file.history
    const dest = file.path

    if (file.event === 'add' || file.event === 'change') {
      manifest.setEntry(origin, dest)
    }

    if (file.event === 'unlink' || file.event === 'unlinkDir') {
      manifest.removeKey(origin)
    }

    const manifestFile = new File({
      path: fileName,
      contents: Buffer.from(manifest.toJson(compact)),
    })

    done(null, manifestFile)
  })
