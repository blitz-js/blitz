import {readFile} from 'fs'
import {Manifest} from './rules/manifest'

export const ManifestLoader = {
  async load(filename: string) {
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
