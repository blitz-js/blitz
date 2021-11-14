import {Box, Text} from "ink"
import * as React from "react"
import {EnterToContinue} from "../components/enter-to-continue"
import {useEnterToContinue} from "../utils/use-enter-to-continue"
import {Executor, executorArgument, ExecutorConfig, getExecutorArgument} from "./executor"

export interface Config extends ExecutorConfig {
  message: executorArgument<string>
}

export const type = "print-message"

export const Commit: Executor["Commit"] = ({cliArgs, cliFlags, onChangeCommitted, step}) => {
  const generatorArgs = React.useMemo(
    () => ({
      message: getExecutorArgument((step as Config).message, cliArgs),
      stepName: getExecutorArgument((step as Config).stepName, cliArgs),
    }),
    [cliArgs, step],
  )
  const [changeCommited, setChangeCommited] = React.useState(false)

  const handleChangeCommitted = React.useCallback(() => {
    setChangeCommited(true)
    onChangeCommitted(generatorArgs.stepName)
  }, [onChangeCommitted, generatorArgs])

  useEnterToContinue(handleChangeCommitted, !cliFlags.yesToAll && !changeCommited)

  React.useEffect(() => {
    if (cliFlags.yesToAll && !changeCommited) {
      handleChangeCommitted()
    }
  }, [changeCommited, cliFlags.yesToAll, handleChangeCommitted])

  return (
    <Box flexDirection="column">
      {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
      <Text>{generatorArgs.message}</Text>
      {!cliFlags.yesToAll && <EnterToContinue />}
    </Box>
  )
}
