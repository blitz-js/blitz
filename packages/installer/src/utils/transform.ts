import * as fs from "fs-extra"
import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"
import getBabelOptions, {Overrides} from "recast/parsers/_babel_options"
import * as babel from "recast/parsers/babel"

export const customTsParser = {
  parse(source: string, options?: Overrides) {
    const babelOptions = getBabelOptions(options)
    babelOptions.plugins.push("typescript")
    babelOptions.plugins.push("jsx")
    return babel.parser.parse(source, babelOptions)
  },
}

export enum TransformStatus {
  Success = "success",
  Failure = "failure",
}
export interface TransformResult {
  status: TransformStatus
  filename: string
  error?: Error
}

export type StringTransformer = (program: string) => string
export type Transformer = (program: Collection<j.Program>) => Collection<j.Program>

export function stringProcessFile(original: string, transformerFn: StringTransformer): string {
  return transformerFn(original)
}

export function processFile(original: string, transformerFn: Transformer): string {
  const program = j(original, {parser: customTsParser})
  return transformerFn(program).toSource()
}

export function transform(
  processFile: (original: string) => string,
  targetFilePaths: string[],
): TransformResult[] {
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
      const fileSource = fileBuffer.toString("utf-8")
      const transformedCode = processFile(fileSource)
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
