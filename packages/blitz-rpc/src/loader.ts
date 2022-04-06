import {
  toPosixPath,
  transformBlitzRpcResolverClient,
  transformBlitzRpcResolverServer,
} from "./index-server"

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
