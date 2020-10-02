import {resolve} from "path"

// TODO: Eventually use a proper reporting mechanism
export const reporter = {
  copy(fileRoot: string, srcPath: string, destPath: string) {
    console.log(`${resolve(fileRoot, srcPath)} => ${resolve(srcPath, destPath)}`)
  },

  remove(fileRoot: string, filePath: string) {
    console.log(`DELETE: ${resolve(fileRoot, filePath)}`)
  },
}
