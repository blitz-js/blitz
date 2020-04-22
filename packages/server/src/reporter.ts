import {resolve} from 'path'
import {progress} from './log'

// TODO: Eventually use a proper reporting mechanism
export const reporter = {
  copy(fileRoot: string, srcPath: string, destPath: string) {
    progress(`${resolve(fileRoot, srcPath)} => ${resolve(srcPath, destPath)}`)
  },

  remove(fileRoot: string, filePath: string) {
    progress(`DELETE: ${resolve(fileRoot, filePath)}`)
  },
}
