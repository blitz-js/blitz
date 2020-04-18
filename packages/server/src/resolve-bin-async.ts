import resolveCwd from 'resolve-cwd'
import findParentDir from 'find-parent-dir'
import path from 'path'

function resolveBin(name: string, cb: Function) {
  var executable = name

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

export function resolveBinAsync(pkg: string) {
  return new Promise<string>((resolve, reject) => {
    resolveBin(pkg, (err: any, bin: string) => {
      if (err) {
        reject(err)
      }
      resolve(bin)
    })
  })
}
