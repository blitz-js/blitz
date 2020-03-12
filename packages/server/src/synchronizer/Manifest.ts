import through2 from 'through2'
import File from 'vinyl'

export class Manifest {
  private origin: {[k: string]: string} = {}
  private destination: {[k: string]: string} = {}

  getDestination(origin: string) {
    return this.origin[origin]
  }
  getOrigin(destination: string) {
    return this.destination[destination]
  }

  setEntry(origin: string, dest: string) {
    this.origin[origin] = dest
    this.destination[dest] = origin
  }

  removeEntry(origin: string) {
    const dest = this.getOrigin(origin)
    if (dest) {
      delete this.origin[origin]
      delete this.destination[dest]
    }
  }
  toJson(compact = false) {
    return JSON.stringify(this.toObject(), null, compact ? undefined : 2)
  }
  toObject() {
    return {
      origin: this.origin,
      destination: this.destination,
    }
  }

  static create() {
    return new Manifest()
  }
}

export const toManifestFile = (manifest: Manifest, fileName: string, pretty: boolean = true) =>
  through2.obj((file, _, done) => {
    const [origin] = file.history
    const dest = file.path
    if (file.event === 'add' || file.event === 'change') {
      manifest.setEntry(origin, dest)
    }

    if (file.event === 'unlink' || file.event === 'unlinkDir') {
      manifest.removeEntry(origin)
    }
    const manifestFile = new File({
      path: fileName,
      contents: Buffer.from(JSON.stringify(manifest.toObject(), null, pretty ? 2 : undefined)),
    })
    done(null, manifestFile)
  })
