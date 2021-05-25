/**
COPYRIGHT (c) 2017-present James Kyle <me@thejameskyle.com>
 MIT License
 Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
 The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWAR
*/
// Implementation of this PR: https://github.com/jamiebuilds/react-loadable/pull/132
// Modified to strip out unneeded results for Next's specific use case

import {
  webpack,
  isWebpack5,
  sources,
} from 'next/dist/compiled/webpack/webpack'

import path from 'path'

function getModuleId(compilation: any, module: any): string | number {
  if (isWebpack5) {
    return compilation.chunkGraph.getModuleId(module)
  }

  return module.id
}

function getModuleFromDependency(
  compilation: any,
  dep: any
): webpack.Module & { resource?: string } {
  if (isWebpack5) {
    return compilation.moduleGraph.getModule(dep)
  }

  return dep.module
}

function getOriginModuleFromDependency(
  compilation: any,
  dep: any
): webpack.Module & { resource?: string } {
  if (isWebpack5) {
    return compilation.moduleGraph.getParentModule(dep)
  }

  return dep.originModule
}

function getChunkGroupFromBlock(
  compilation: any,
  block: any
): webpack.compilation.ChunkGroup {
  if (isWebpack5) {
    return compilation.chunkGraph.getBlockChunkGroup(block)
  }

  return block.chunkGroup
}

function buildManifest(
  _compiler: webpack.Compiler,
  compilation: webpack.compilation.Compilation,
  pagesDir: string
) {
  let manifest: { [k: string]: { id: string | number; files: string[] } } = {}

  // This is allowed:
  // import("./module"); <- ImportDependency

  // We don't support that:
  // import(/* webpackMode: "eager" */ "./module") <- ImportEagerDependency
  // import(`./module/${param}`) <- ImportContextDependency

  // Find all dependencies blocks which contains a `import()` dependency
  const handleBlock = (block: any) => {
    block.blocks.forEach(handleBlock)
    const chunkGroup = getChunkGroupFromBlock(compilation, block)
    for (const dependency of block.dependencies) {
      if (dependency.type.startsWith('import()')) {
        // get the referenced module
        const module = getModuleFromDependency(compilation, dependency)
        if (!module) return

        // get the module containing the import()
        const originModule = getOriginModuleFromDependency(
          compilation,
          dependency
        )
        const originRequest: string | undefined = originModule?.resource
        if (!originRequest) return

        // We construct a "unique" key from origin module and request
        // It's not perfect unique, but that will be fine for us.
        // We also need to construct the same in the babel plugin.
        const key = `${path.relative(pagesDir, originRequest)} -> ${
          dependency.request
        }`

        // Capture all files that need to be loaded.
        const files = new Set<string>()

        if (manifest[key]) {
          // In the "rare" case where multiple chunk groups
          // are created for the same `import()` or multiple
          // import()s reference the same module, we merge
          // the files to make sure to not miss files
          // This may cause overfetching in edge cases.
          for (const file of manifest[key].files) {
            files.add(file)
          }
        }

        // There might not be a chunk group when all modules
        // are already loaded. In this case we only need need
        // the module id and no files
        if (chunkGroup) {
          for (const chunk of (chunkGroup as any)
            .chunks as webpack.compilation.Chunk[]) {
            chunk.files.forEach((file: string) => {
              if (
                (file.endsWith('.js') || file.endsWith('.css')) &&
                file.match(/^static\/(chunks|css)\//)
              ) {
                files.add(file)
              }
            })
          }
        }

        // usually we have to add the parent chunk groups too
        // but we assume that all parents are also imported by
        // next/dynamic so they are loaded by the same technique

        // add the id and files to the manifest
        const id = getModuleId(compilation, module)
        manifest[key] = { id, files: Array.from(files) }
      }
    }
  }
  for (const module of compilation.modules) {
    module.blocks.forEach(handleBlock)
  }

  manifest = Object.keys(manifest)
    .sort()
    // eslint-disable-next-line no-sequences
    .reduce((a, c) => ((a[c] = manifest[c]), a), {} as any)

  return manifest
}

export class ReactLoadablePlugin {
  private filename: string
  private pagesDir: string

  constructor(opts: { filename: string; pagesDir: string }) {
    this.filename = opts.filename
    this.pagesDir = opts.pagesDir
  }

  createAssets(compiler: any, compilation: any, assets: any) {
    const manifest = buildManifest(compiler, compilation, this.pagesDir)
    // @ts-ignore: TODO: remove when webpack 5 is stable
    assets[this.filename] = new sources.RawSource(
      JSON.stringify(manifest, null, 2)
    )
    return assets
  }

  apply(compiler: webpack.Compiler) {
    if (isWebpack5) {
      compiler.hooks.make.tap('ReactLoadableManifest', (compilation) => {
        // @ts-ignore TODO: Remove ignore when webpack 5 is stable
        compilation.hooks.processAssets.tap(
          {
            name: 'ReactLoadableManifest',
            // @ts-ignore TODO: Remove ignore when webpack 5 is stable
            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
          },
          (assets: any) => {
            this.createAssets(compiler, compilation, assets)
          }
        )
      })
      return
    }

    compiler.hooks.emit.tap('ReactLoadableManifest', (compilation: any) => {
      this.createAssets(compiler, compilation, compilation.assets)
    })
  }
}
