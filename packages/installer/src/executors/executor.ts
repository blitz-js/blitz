import {log} from '@blitzjs/server'

export interface BaseExecutor {
  stepId: string | number
  stepName: string
  // a bit to display to the user to give context to the change
  explanation: string
}

type dynamicExecutorArgument<T> = (cliArgs: any) => T

function isDynamicExecutorArgument<T>(input: executorArgument<T>): input is dynamicExecutorArgument<T> {
  return typeof (input as dynamicExecutorArgument<T>) === 'function'
}

export type executorArgument<T> = T | dynamicExecutorArgument<T>

export function logExecutorFrontmatter(executor: BaseExecutor) {
  console.log()
  const lineLength = executor.stepName.length + 6
  const verticalBorder = `+${new Array(lineLength).fill('–').join('')}+`
  log.branded(verticalBorder)
  log.branded(`⎪   ${executor.stepName}   ⎪`)
  log.branded(verticalBorder)
  log.info(executor.explanation)
  console.log()
}

export function getExecutorArgument<T>(input: executorArgument<T>, cliArgs: any): T {
  if (isDynamicExecutorArgument(input)) {
    return input(cliArgs)
  }
  return input
}
