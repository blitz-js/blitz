import {BaseExecutor, executorArgument, getExecutorArgument} from './executor'
import {Generator, GeneratorOptions} from '@blitzjs/generator'
import {log} from '@blitzjs/server/src/log'
import {waitForConfirmation} from '../utils/wait-for-confirmation'

export interface NewFileExecutor extends BaseExecutor {
  templatePath: executorArgument<string>
  templateValues: executorArgument<{[key: string]: string}>
  destinationRoot?: executorArgument<string>
  destinationPathPrompt?: executorArgument<string>
}

export function isNewFileExecutor(executor: BaseExecutor): executor is NewFileExecutor {
  return (executor as NewFileExecutor).templatePath !== undefined
}

interface TempGeneratorOptions extends GeneratorOptions {
  templateRoot: string
  templateValues: any
}

class TempGenerator extends Generator<TempGeneratorOptions> {
  sourceRoot: string
  templateValues: any

  constructor(options: TempGeneratorOptions) {
    super(options)
    this.sourceRoot = options.templateRoot
    this.templateValues = options.templateValues
  }

  getTemplateValues() {
    return this.templateValues
  }
}

export async function newFileExecutor(executor: NewFileExecutor, cliArgs: any): Promise<void> {
  log.branded(`[Create Files Step] ${executor.stepName}`)
  log.info(executor.explanation)
  const generatorArgs = {
    destinationRoot: '.',
    fileContext: getExecutorArgument(executor.destinationRoot, cliArgs) || '',
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
  await waitForConfirmation('To commit the changes, press any key to confirm. Press Ctrl+C to abort')
  await commitGenerator.run()
}
