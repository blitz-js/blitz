import {readFile} from 'fs'
import {Manifest} from './stages/manifest'

export const ManifestLoader = {
  load(filename: string) {
    return new Promise((resolve, reject) => {
      readFile(filename, 'utf8', (err, data) => {
        if (err) {
          return reject(err)
        }
        resolve(Manifest.create(JSON.parse(data)))
      })
    })
  },
}
