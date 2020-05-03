import {BaseExecutor, executorArgument, getExecutorArgument} from './executor'
import {filePrompt} from './file-prompt'
import {transform, Transformer, TransformStatus} from '../utils/transform'
import {log} from '@blitzjs/server/src/log'

export interface FileTransformExecutor extends BaseExecutor {
  selectTargetFiles?(cliArgs: any): any[]
  singleFileSearch?: executorArgument<string>
  transform: Transformer
}

export function isFileTransformExecutor(executor: BaseExecutor): executor is FileTransformExecutor {
  return (executor as FileTransformExecutor).transform !== undefined
}

export async function fileTransformExecutor(executor: FileTransformExecutor, cliArgs: any): Promise<void> {
  log.branded(`[Transform Files Step] ${executor.stepName}`)
  log.info(executor.explanation)
  const fileToTransform: string = await filePrompt({
    context: cliArgs,
    globFilter: getExecutorArgument(executor.singleFileSearch, cliArgs),
    getChoices: executor.selectTargetFiles,
  })
  const transformResults = transform(executor.transform, [fileToTransform])
  for (const result of transformResults) {
    if (result.status === TransformStatus.Failure) {
      log.warning(
        `Failed to update '${result.filename}'. This is likely a bug and should be reported to the author of the installer`,
      )
    } else {
      log.success(`Updated '${result.filename}' successfully`)
    }
  }
}
