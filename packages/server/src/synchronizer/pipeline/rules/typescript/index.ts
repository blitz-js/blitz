import * as ts from 'typescript'
import File from 'vinyl'
import ignore from 'ignore'

import {through} from '../../../streams'
import {Rule} from '../../../types'
import {FILE_COMPILED} from '../../../events'
import {log} from '../../../../log'

const ignorePaths = ['/**/{pages,components}/**/*.js']
const ig = ignore().add(ignorePaths)

/**
 * Returns a Rule that compiles TS files to JS.
 */
export const createRuleTypescript: Rule = ({config, reporter}) => {
  const stream = through({objectMode: true}, function (file: File, _, next) {
    log
      .spinner('Working on: ' + file.basename)
      .start()
      .succeed()
    log
      .spinner('Ignored: ' + ig.ignores(file.path))
      .start()
      .succeed()

    if (config.isTsProject || file.extname !== '.js' || ig.ignores(file.path)) return next(null, file)

    const fileContent = file.contents
    log
      .spinner('Content of ' + file.basename + ': ' + fileContent)
      .start()
      .succeed()

    log
      .spinner('Writing to: ' + file.path)
      .start()
      .succeed()

    const compiledFile = ts.transpileModule(fileContent!.toString(), {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.Preserve,
        allowJs: true,
        lib: ['dom', 'dom.iterable', 'esnext'],
        target: ts.ScriptTarget.ES5,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        resolveJsonModule: true,
        isolatedModules: true,
        esModuleInterop: true,
      },
    })

    const newFile = new File({
      path: file.path,
      contents: new Buffer(compiledFile.outputText),
    })

    reporter.write({type: FILE_COMPILED, payload: file})
    next(null, newFile)
  })

  return {stream}
}
