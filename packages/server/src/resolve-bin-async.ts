import resolveBin from 'resolve-bin'

export function resolveBinAsync(pkg: string) {
  return new Promise<string>((resolve, reject) => {
    resolveBin(pkg, (err, bin) => {
      if (err) {
        reject(err)
      }
      resolve(bin)
    })
  })
}
