import File from 'vinyl'
import {resolve} from 'path'
import {pathExists} from 'fs-extra'
import {Rule} from '../types'
const deafultNextConfig = `module.exports = {}`

type Args = {
  srcPath: string
  destPath: string
}

export default function configure({destPath, srcPath}: Args): Rule {
  return (stream) => {
    pathExists(resolve(srcPath, 'next.config.js')).then((hasNextConfig: boolean) => {
      if (!hasNextConfig) {
        stream.push(
          new File({
            path: resolve(destPath, 'next.config.js'),
            contents: Buffer.from(deafultNextConfig),
          }),
        )
      }
    })

    return stream
  }
}
