import {ExecutorConfig, executorArgument, getExecutorArgument} from './executor'
import {Generator, GeneratorOptions} from '@blitzjs/generator'
import {log} from '@blitzjs/display'
import {waitForConfirmation} from '../utils/wait-for-confirmation'

export interface Config extends ExecutorConfig {
  targetDirectory?: executorArgument<string>
  templatePath: executorArgument<string>
  templateValues: executorArgument<{[key: string]: string}>
  destinationPathPrompt?: executorArgument<string>
}

export function isNewFileExecutor(executor: ExecutorConfig): executor is Config {
  return (executor as Config).templatePath !== undefined
}

export const type = 'new-file'
export const Propose = () => null
export const Commit = () => null

interface TempGeneratorOptions extends GeneratorOptions {
  targetDirectory?: string
  templateRoot: string
  templateValues: any
}

class TempGenerator extends Generator<TempGeneratorOptions> {
  sourceRoot: string
  targetDirectory: string
  templateValues: any

  constructor(options: TempGeneratorOptions) {
    super(options)
    this.sourceRoot = options.templateRoot
    this.templateValues = options.templateValues
    this.targetDirectory = options.targetDirectory || '.'
  }

  getTemplateValues() {
    return this.templateValues
  }

  getTargetDirectory() {
    return this.targetDirectory
  }
}

export async function newFileExecutor(executor: Config, cliArgs: any): Promise<void> {
  const generatorArgs = {
    destinationRoot: '.',
    targetDirectory: getExecutorArgument(executor.targetDirectory, cliArgs),
    templateRoot: getExecutorArgument(executor.templatePath, cliArgs),
    templateValues: getExecutorArgument(executor.templateValues, cliArgs),
  }
  const dryRunGenerator = new TempGenerator({
    ...generatorArgs,
    dryRun: true,
  })
  const commitGenerator = new TempGenerator(generatorArgs)
  log.progress("First we'll do a dry-run. Here's a list of files that would be created:")
  await dryRunGenerator.run()
  await waitForConfirmation('To commit the changes, press enter. Press Ctrl+C to abort')
  await commitGenerator.run()
}
