import fs from 'fs'
import path from 'path'
import * as ts from 'typescript'
import File from 'vinyl'
import {pathExistsSync} from 'fs-extra'

import {through} from '../../../streams'
import {Rule} from '../../../types'
import {FILE_COMPILED} from '../../../events'

/**
 * Returns a Rule that compiles TS files to JS.
 */
export const createRuleTypescript: Rule = ({config, reporter}) => {
  const tsConfigPath = path.resolve(config.src, 'tsconfig.json')
  const isTsProject = pathExistsSync(tsConfigPath)

  const stream = through({objectMode: true}, function (file: File, _, next) {
    if (isTsProject) next(null, file)

    const tsconfig = readConfigFile(tsConfigPath)
    const filePath = file.path

    const compiledFile = ts.transpileModule(filePath, {compilerOptions: tsconfig.options})

    const newFile = new File({
      path: file.path,
      contents: new Buffer(compiledFile.outputText),
    })

    reporter.write({type: FILE_COMPILED, payload: file})

    next(null, newFile)
  })

  return {stream}
}

const readConfigFile = (configFileName: string) => {
  // Read config file
  const configFileText = fs.readFileSync(configFileName).toString()

  // Parse JSON, after removing comments. Just fancier JSON.parse
  const result = ts.parseConfigFileTextToJson(configFileName, configFileText)
  const configObject = result.config
  if (!configObject) {
    process.exit(1)
  }

  // Extract config information
  const configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, path.dirname(configFileName))
  if (configParseResult.errors.length > 0) {
    process.exit(1)
  }
  return configParseResult
}
