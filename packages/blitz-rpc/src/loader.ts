import {assertPosixPath, toPosixPath} from "./index-server"
import {assert} from "blitz"
import blitzRpcServerTransform from "./babel/plugins/blitz-rpc-server-transform"
import {posix} from "path"

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
    const {code} = await transformBlitzRpcResolverServer(input, toPosixPath(id), toPosixPath(root))
    return code
  }

  const {code} = await transformBlitzRpcResolverClient(input, toPosixPath(id), toPosixPath(root))
  return code
}

module.exports = loader

// -------------
// TRANSFORM SSR
// -------------
export async function transformBlitzRpcResolverServer(src: string, id: string, root: string) {
  assertPosixPath(id)
  assertPosixPath(root)

  return {
    code: getServerCode(src, id.replace(root, "")),
    map: null,
  }
}

function getServerCode(src: string, filePath: string) {
  assertPosixPath(filePath)

  // const blitzImport = 'import { __internal_addBlitzRpcResolver } from "@blitzjs/rpc";'
  // // No break line between `blitzImport` and `src` in order to preserve the source map's line mapping
  // let code = blitzImport + src
  // code += "\n\n"
  // code += `__internal_addBlitzRpcResolver({}, {filePath: "${filePath}"});`
  // code += "\n"

  const babel = require("@babel/core")
  const code = babel.transform(src, {
    configFile: false,
    plugins: [[blitzRpcServerTransform, {filePath}]],
  })?.code
  assert(code, "failed to parse Blitz RPC resolver: " + filePath)

  return code
}
// -------------
// END TRANSFORM SSR
// -------------

// ----------------
// TRANSFORM CLIENT
// ----------------
export async function transformBlitzRpcResolverClient(_src: string, id: string, root: string) {
  return transformResolverSync(id, root)
}
function transformResolverSync(id: string, root: string) {
  assertPosixPath(id)
  assertPosixPath(root)

  const resolverFilePath = "/" + posix.relative(root, id)
  assert(!resolverFilePath.startsWith("/."), "TODO")
  assertPosixPath(resolverFilePath)

  return {
    code: getClientCode(resolverFilePath),
    map: null,
  }
}

export function getClientCode(resolverFilePath: string) {
  const lines: string[] = []

  lines.push("// @ts-nocheck")

  lines.push(`import { __internal_fetchBlitzRpc } from "@blitzjs/rpc";`)

  const exportValue = `(...args) => __internal_fetchBlitzRpc('${resolverFilePath}', args);`
  lines.push(`export default ${exportValue}`)

  const code = lines.join("\n")
  return code
}
// --------------------
// END TRANSFORM CLIENT
// --------------------
