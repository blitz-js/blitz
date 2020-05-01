import pkgDir from 'pkg-dir'

export const projectRoot = pkgDir.sync() || process.cwd()
