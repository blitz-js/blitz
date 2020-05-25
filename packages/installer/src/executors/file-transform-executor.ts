import {ExecutorConfig, executorArgument, getExecutorArgument} from './executor'
import {filePrompt} from './file-prompt'
import {transform, Transformer} from '../utils/transform'
import {log} from '@blitzjs/display'
import {waitForConfirmation} from '../utils/wait-for-confirmation'
import {createPatch} from 'diff'
import chokidar from 'chokidar'
import * as fs from 'fs-extra'
import chalk from 'chalk'

export interface Config extends ExecutorConfig {
  selectTargetFiles?(cliArgs: any): any[]
  singleFileSearch?: executorArgument<string>
  transform: Transformer
}

export function isFileTransformExecutor(executor: ExecutorConfig): executor is Config {
  return (executor as Config).transform !== undefined
}

export const type = 'file-transform'
export const Propose = () => null
export const Commit = () => null

async function executeWithDiff(transformFn: Transformer, filePath: string) {
  await new Promise((res, rej) => {
    const watcher = chokidar.watch(filePath)
    const originalFileContents = fs.readFileSync(filePath).toString('utf-8')
    watcher.on('change', (path) => {
      watcher.close().then(() => {
        const patch = createPatch(path, originalFileContents, fs.readFileSync(path).toString('utf-8'))
        patch
          .split('\n')
          .slice(2)
          .forEach((line) => {
            if (line.startsWith('-') && !line.startsWith('---')) console.log(chalk.bold.red(line))
            else if (line.startsWith('+') && !line.startsWith('+++')) console.log(chalk.bold.green(line))
            else console.log(line)
          })
        res(path)
      })
    })
    watcher.on('error', (error) => {
      rej(error)
    })
    transform(transformFn, [filePath])
  })
}

export async function fileTransformExecutor(executor: Config, cliArgs: any): Promise<void> {
  const fileToTransform: string = await filePrompt({
    context: cliArgs,
    globFilter: getExecutorArgument(executor.singleFileSearch, cliArgs),
    getChoices: executor.selectTargetFiles,
  })
  try {
    await executeWithDiff(executor.transform, fileToTransform)
    await waitForConfirmation('The above changes were applied. Press enter to continue')
  } catch (err) {
    log.error(`Failed to transform ${fileToTransform}`)
  }
}
