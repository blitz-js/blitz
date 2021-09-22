import {Box, Text} from "ink"
import * as React from "react"
import {Newline} from "../components/newline"
import {useEnterToContinue} from "../utils/use-enter-to-continue"
import {Executor, executorArgument, ExecutorConfig, getExecutorArgument} from "./executor"

export interface Config extends ExecutorConfig {
  message: executorArgument<string>
}

export const type = "print-message"

export const Commit: Executor["Commit"] = ({cliArgs, onChangeCommitted, step}) => {
  const generatorArgs = React.useMemo(
    () => ({
      message: getExecutorArgument((step as Config).message, cliArgs),
      stepName: getExecutorArgument((step as Config).stepName, cliArgs),
    }),
    [cliArgs, step],
  )

  const handleChangeCommitted = React.useCallback(() => {
    onChangeCommitted(generatorArgs.stepName)
  }, [onChangeCommitted, generatorArgs])

  useEnterToContinue(handleChangeCommitted)

  return (
    <Box flexDirection="column">
      {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
      <Text>{generatorArgs.message}</Text>
      <Newline />
      <Text bold>Press ENTER to continue</Text>
    </Box>
  )
}
