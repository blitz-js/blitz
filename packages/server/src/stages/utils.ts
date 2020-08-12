import fs from "fs"
import path, {relative, resolve} from "path"
import pkgDir from "pkg-dir"

// Transform an absolute path with a relative path transformer
export const absolutePathTransform = (sourceFolder = "") => (
  relativeTransformer: (s: string) => string,
) => (filePath: string) => {
  const startingPath = relative(sourceFolder, filePath)
  const transformedPath = relativeTransformer(startingPath)
  return resolve(sourceFolder, transformedPath)
}

export const isTypescript = () =>
  fs.existsSync(path.join(pkgDir.sync() || process.cwd(), "tsconfig.json"))
