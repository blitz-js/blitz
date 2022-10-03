import {Box, Text} from "ink"
import * as React from "react"
import {EnterToContinue} from "../components/enter-to-continue"
import {useEnterToContinue} from "../utils/use-enter-to-continue"
import {useUserInput} from "../utils/use-user-input"
import {IExecutor, executorArgument, ExecutorConfig, getExecutorArgument} from "./executor"

export interface Config extends ExecutorConfig {
  message: executorArgument<string>
}

export const type = "print-message"

export const Commit: IExecutor["Commit"] = ({cliArgs, cliFlags, onChangeCommitted, step}) => {
  const userInput = useUserInput(cliFlags)
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

  const childProps: CommitChildProps = {
    changeCommited,
    generatorArgs,
    handleChangeCommitted,
  }

  if (userInput) return <CommitWithInput {...childProps} />
  else return <CommitWithoutInput {...childProps} />
}

interface CommitChildProps {
  changeCommited: boolean
  generatorArgs: {message: string; stepName: string}
  handleChangeCommitted: () => void
}

const CommitWithInput = ({
  changeCommited,
  generatorArgs,
  handleChangeCommitted,
}: CommitChildProps) => {
  useEnterToContinue(handleChangeCommitted, !changeCommited)

  return (
    <Box flexDirection="column">
      <Text>{generatorArgs.message}</Text>
      <EnterToContinue />
    </Box>
  )
}

const CommitWithoutInput = ({
  changeCommited,
  generatorArgs,
  handleChangeCommitted,
}: CommitChildProps) => {
  React.useEffect(() => {
    if (!changeCommited) {
      handleChangeCommitted()
    }
  }, [changeCommited, handleChangeCommitted])

  return (
    <Box flexDirection="column">
      <Text>{generatorArgs.message}</Text>
    </Box>
  )
}
