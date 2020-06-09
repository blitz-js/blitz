import pkgDir from 'pkg-dir'

const projectRoot = pkgDir.sync() || process.cwd()

console.log(projectRoot)
