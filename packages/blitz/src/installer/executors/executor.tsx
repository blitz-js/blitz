import {Box, Text} from "ink"
import * as React from "react"
import {Newline} from "../components/newline"
import {RecipeCLIArgs, RecipeCLIFlags} from "../types"

export interface ExecutorConfig {
  successIcon?: string
  stepId: string | number
  stepName: string
  stepType: string
  // a bit to display to the user to give context to the change
  explanation: string
}

export interface IExecutor {
  type: string
  Propose?: React.FC<{
    step: ExecutorConfig
    onProposalAccepted: (data?: any) => void
    cliArgs: RecipeCLIArgs
    cliFlags: RecipeCLIFlags
  }>
  Commit: React.FC<{
    step: ExecutorConfig
    proposalData?: any
    onChangeCommitted: (data?: any) => void
    cliArgs: RecipeCLIArgs
    cliFlags: RecipeCLIFlags
  }>
}

type dynamicExecutorArgument<T> = (cliArgs: RecipeCLIArgs) => T

function isDynamicExecutorArgument<T>(
  input: executorArgument<T>,
): input is dynamicExecutorArgument<T> {
  return typeof (input as dynamicExecutorArgument<T>) === "function"
}

export type executorArgument<T> = T | dynamicExecutorArgument<T>

export function Frontmatter({executor}: {executor: ExecutorConfig}) {
  const lineLength = executor.stepName.length + 6
  const verticalBorder = `+${new Array(lineLength).fill("–").join("")}+`
  return (
    <Box flexDirection="column" paddingBottom={1}>
      <Newline />
      <Box flexDirection="column">
        <Text color="#8a3df0" bold>
          {verticalBorder}
        </Text>
        <Text color="#8a3df0" bold>
          ⎪&nbsp;&nbsp;&nbsp;{executor.stepName}&nbsp;&nbsp;&nbsp;⎪
        </Text>
        <Text color="#8a3df0" bold>
          {verticalBorder}
        </Text>
      </Box>
      <Text color="gray" italic>
        {executor.explanation}
      </Text>
    </Box>
  )
}

export function getExecutorArgument<T>(input: executorArgument<T>, cliArgs: RecipeCLIArgs): T {
  if (isDynamicExecutorArgument(input)) {
    return input(cliArgs)
  }
  return input
}
