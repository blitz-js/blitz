import {assert} from "blitz"
export * from "./index-browser"

import {win32, posix, sep} from "path"

// -----
// UTILS
// -----
function assertPosixPath(path: string) {
  const errMsg = `Wrongly formatted path: ${path}`
  assert(!path.includes(win32.sep), errMsg)
  // assert(path.startsWith('/'), errMsg)
}

function toPosixPath(path: string) {
  if (process.platform !== "win32") {
    assert(sep === posix.sep, "TODO")
    assertPosixPath(path)
    return path
  } else {
    assert(sep === win32.sep, "TODO")
    const pathPosix = path.split(win32.sep).join(posix.sep)
    assertPosixPath(pathPosix)
    return pathPosix
  }
}

function toSystemPath(path: string) {
  path = path.split(posix.sep).join(sep)
  path = path.split(win32.sep).join(sep)
  return path
}
// ---------
// END UTILS
// ---------

// -------------
// TRANSFORM SSR
// -------------
async function transformTelefuncFileSSR(src: string, id: string, root: string) {
  assertPosixPath(id)
  assertPosixPath(root)

  return {
    code: getServerCode(src, id.replace(root, "")),
    map: null,
  }
}

function getServerCode(src: string, filePath: string) {
  assertPosixPath(filePath)

  const telefuncImport = 'import { __internal_addTelefunction } from "@blitzjs/rpc";'

  // No break line between `telefuncImport` and `src` in order to preserve the source map's line mapping
  let code = telefuncImport + src

  const exportNames = ["default"]

  code += "\n\n"
  for (const exportName of exportNames) {
    code += `__internal_addTelefunction(${exportName}, "${exportName}", "${filePath}");`
    code += "\n"
  }

  return code
}
// -------------
// END TRANSFORM SSR
// -------------

// ----------------
// TRANSFORM CLIENT
// ----------------
async function transformTelefuncFile(src: string, id: string, root: string) {
  const exportNames = ["default"]
  return transformTelefuncFileSync(id, root, exportNames)
}
function transformTelefuncFileSync(
  id: string,
  root: string,
  exportNames: readonly string[] | string[],
) {
  assertPosixPath(id)
  assertPosixPath(root)

  const telefuncFilePath = "/" + posix.relative(root, id)
  assert(!telefuncFilePath.startsWith("/."), "TODO")
  assertPosixPath(telefuncFilePath)

  return {
    code: getClientCode(exportNames, telefuncFilePath),
    map: null,
  }
}

export function getClientCode(exportNames: readonly string[], telefuncFilePath: string) {
  const lines: string[] = []

  lines.push("// @ts-nocheck")

  lines.push(`import { __internal_fetchTelefunc } from "@blitzjs/rpc";`)

  exportNames.forEach((exportName) => {
    const exportValue = `(...args) => __internal_fetchTelefunc('${telefuncFilePath}', '${exportName}', args);`
    if (exportName === "default") {
      lines.push(`export default ${exportValue}`)
    } else {
      lines.push(`export const ${exportName} = ${exportValue};`)
    }
  })

  const code = lines.join("\n")
  return code
}
// --------------------
// END TRANSFORM CLIENT
// --------------------

// Subset of `import type { LoaderDefinitionFunction } from 'webpack'`
type Loader = {
  _compiler?: {
    name: string
    context: string
  }
  resource: string
}

export async function loader(this: Loader, input: string): Promise<string> {
  const compiler = this._compiler!
  const id = this.resource
  const root = this._compiler!.context

  // TODO - enable?
  // assert(id.includes("queries"), "TODO")

  const isSSR = compiler.name === "server"
  if (isSSR) {
    const {code} = await transformTelefuncFileSSR(input, toPosixPath(id), toPosixPath(root))
    return code
  }

  const {code} = await transformTelefuncFile(input, toPosixPath(id), toPosixPath(root))
  return code
}

// import type { NextConfig } from 'next'
// import { resolve } from 'path'
// const dir = __dirname + (() => '')() // trick to avoid `@vercel/ncc` to glob import
// const loader = resolve(dir, './loader.js')
//
// function install<T extends any[]>(config: { module?: { rules?: T } }) {
//   config.module!.rules!.push({
//     test: /\.telefunc\./,
//     use: [{ loader }]
//   })
// }
//
// function telefuncPlugin(nextConfig: NextConfig = {}) {
//   return Object.assign({}, nextConfig, {
//     webpack: (config, options) => {
//       install(config)
//       if (typeof nextConfig.webpack === 'function') {
//         return nextConfig.webpack(config, options)
//       }
//       return config
//     }
//   } as NextConfig)
// }

// ------
// LOADER
// ------
// Mechanism used by Vite/Next/Nuxt plugins for automatically loading `.telefunc.js` files.

export {loadTelefuncFilesWithInternalMechanism}
export {__internal_addTelefunction}

function isObject(value: unknown): value is Record<string | symbol, unknown> {
  return typeof value === "object" && value !== null
}
function getGlobalObject<T extends Record<string, unknown>>(key: string, defaultValue: T): T {
  assert(key.startsWith("__internal_telefunc"), "TODO")
  if (typeof global === "undefined") {
    return defaultValue
  }
  assert(isObject(global), "TODO")
  return ((global as Record<string, unknown>)[key] =
    ((global as Record<string, unknown>)[key] as T) || defaultValue)
}

type Telefunction = (...args: unknown[]) => Promise<unknown>
type FileExports = Record<string, unknown>
type TelefuncFiles = Record<string, FileExports>

// We define `global.__internal_telefuncFiles` to ensure we use the same global object.
// Needed for Next.js. I'm guessing that Next.js is including the `node_modules/` files in a seperate bundle than user files.
const g = getGlobalObject<{telefuncFilesLoaded: TelefuncFiles | null}>("__internal_telefuncFiles", {
  telefuncFilesLoaded: null,
})

function loadTelefuncFilesWithInternalMechanism() {
  return g.telefuncFilesLoaded
}

function __internal_addTelefunction(
  telefunction: Telefunction,
  telefunctionFileExport: string,
  telefuncFilePath: string,
) {
  g.telefuncFilesLoaded = g.telefuncFilesLoaded || {}
  g.telefuncFilesLoaded[telefuncFilePath] = {
    ...g.telefuncFilesLoaded[telefuncFilePath],
    [telefunctionFileExport]: telefunction,
  }
}
// ----------
// END LOADER
// ----------
