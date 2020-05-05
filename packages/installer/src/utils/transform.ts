import * as fs from 'fs-extra'
import {parse, print, types} from 'recast'
import {builders} from 'ast-types/gen/builders'
import {namedTypes, NamedTypes} from 'ast-types/gen/namedTypes'
import * as babel from 'recast/parsers/babel'
import getBabelOptions, {Overrides} from 'recast/parsers/_babel_options'

const customTsParser = {
  parse(source: string, options?: Overrides) {
    const babelOptions = getBabelOptions(options)
    babelOptions.plugins.push('typescript')
    babelOptions.plugins.push('jsx')
    return babel.parser.parse(source, babelOptions)
  },
}

export enum TransformStatus {
  Success = 'success',
  Failure = 'failure',
}
export interface TransformResult {
  status: TransformStatus
  filename: string
  error?: Error
}
export type Transformer = (ast: types.ASTNode, builder: builders, types: NamedTypes) => types.ASTNode

export function transform(transformerFn: Transformer, targetFilePaths: string[]): TransformResult[] {
  const results: TransformResult[] = []
  for (const filePath of targetFilePaths) {
    if (!fs.existsSync(filePath)) {
      results.push({
        status: TransformStatus.Failure,
        filename: filePath,
        error: new Error(`Error: ${filePath} not found`),
      })
    }
    try {
      const fileBuffer = fs.readFileSync(filePath)
      const fileSource = fileBuffer.toString('utf-8')
      const ast = parse(fileSource, {parser: customTsParser})
      const transformedCode = print(transformerFn(ast, types.builders, namedTypes)).code
      fs.writeFileSync(filePath, transformedCode)
      results.push({
        status: TransformStatus.Success,
        filename: filePath,
      })
    } catch (err) {
      results.push({
        status: TransformStatus.Failure,
        filename: filePath,
        error: err,
      })
    }
  }
  return results
}
