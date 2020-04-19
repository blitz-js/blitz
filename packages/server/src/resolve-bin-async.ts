import resolveCwd from 'resolve-cwd'
import findParentDir from 'find-parent-dir'
import path from 'path'

// This code originally from https://github.com/thlorenz/resolve-bin
// It's inlined here because we need to use resolveCwd
function resolveBin(name: string, executable: string, cb: Function) {
  var mod
  try {
    mod = resolveCwd(name)
  } catch (err) {
    return cb(err)
  }

  findParentDir(mod, 'package.json', function (err, dir) {
    if (err) return cb(err)

    var pack = require(path.join(dir as string, 'package.json'))
    var binfield = pack.bin

    var binpath = typeof binfield === 'object' ? binfield[executable] : binfield
    if (!binpath) return cb(new Error('No bin `' + executable + '` in module `' + name + '`'))

    var bin = path.join(dir as string, binpath)
    cb(null, bin)
  })
}

export function resolveBinAsync(pkg: string, executable = pkg) {
  return new Promise<string>((resolve, reject) => {
    resolveBin(pkg, executable, (err: any, bin: string) => {
      if (err) {
        reject(err)
      }
      resolve(bin)
    })
  })
}
