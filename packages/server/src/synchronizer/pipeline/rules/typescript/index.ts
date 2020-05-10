import * as ts from 'typescript'
import File from 'vinyl'

import {through} from '../../../streams'
import {Rule} from '../../../types'
import {FILE_COMPILED} from '../../../events'

/**
 * Returns a Rule that compiles TS files to JS.
 */
export const createRuleTypescript: Rule = ({config, reporter}) => {
  const stream = through({objectMode: true}, function (file: File, _, next) {
    // Skip file if is not a js file or it is a Typescript project.
    if (config.isTsProject || file.extname !== '.js') return next(null, file)

    const compiledFile = ts.transpileModule(file.contents!.toString(), {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.Preserve,
        allowJs: true,
        lib: ['dom', 'dom.iterable', 'esnext'],
        target: ts.ScriptTarget.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        resolveJsonModule: true,
        isolatedModules: true,
        esModuleInterop: true,
      },
    })

    file.contents = Buffer.from(compiledFile.outputText)

    reporter.write({type: FILE_COMPILED, payload: file})
    next(null, file)
  })

  return {stream}
}
