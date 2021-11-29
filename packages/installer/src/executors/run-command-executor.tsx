import {spawn} from "cross-spawn"
import {Box, Text} from "ink"
import Spinner from "ink-spinner"
import * as React from "react"
import {Newline} from "../components/newline"
import {RecipeCLIArgs} from "../types"
import {useEnterToContinue} from "../utils/use-enter-to-continue"
import {useUserInput} from "../utils/use-user-input"
import {Executor, ExecutorConfig, getExecutorArgument} from "./executor"

export interface CliCommand {
  command: string
  commandArgs?: string[]
}

export interface Config extends ExecutorConfig {
  command: CliCommand
}

export interface CommitChildProps {
  commandInstalled: boolean
  handleChangeCommitted: () => void
  step: Config
  cliArgs: RecipeCLIArgs
}

export const type = "run-command"

function Command({step, loading}: {step: Config; loading: boolean}) {
  return (
    <Text>
      {`   `}
      {loading ? <Spinner /> : "✅"}
      {` ${step.command}`}
    </Text>
  )
}

const CommandList = ({
  lede = "Hang tight! Running...",
  commandLoading = false,
  step,
}: {
  lede?: string
  commandLoading?: boolean
  step: Config
}) => {
  return (
    <Box flexDirection="column">
      <Text>{lede}</Text>
      <Newline />
      <Command key={step.stepId} step={step} loading={commandLoading} />
    </Box>
  )
}

/**
 * Exported for unit testing purposes
 */
export async function executeCommand(command: string, commandArgs?: string[]) {
  await new Promise((resolve) => {
    const cp = spawn(command, commandArgs || [], {
      stdio: ["inherit", "pipe", "pipe"],
    })
    cp.on("exit", resolve)
  })
}

export const Commit: Executor["Commit"] = ({cliArgs, cliFlags, step, onChangeCommitted}) => {
  const userInput = useUserInput(cliFlags)
  const [commandInstalled, setCommandInstalled] = React.useState(false)

  const handleChangeCommitted = React.useCallback(() => {
    onChangeCommitted(`Executed command`)
  }, [onChangeCommitted])

  React.useEffect(() => {
    async function runCommand() {
      const executorCommand = getExecutorArgument((step as Config).command, cliArgs)
      const command = executorCommand.command
      const commandArgs = executorCommand.commandArgs
      await executeCommand(command, commandArgs)
      setCommandInstalled(true)
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    runCommand()
  }, [cliArgs, step])

  React.useEffect(() => {
    if (commandInstalled) {
      handleChangeCommitted()
    }
  }, [commandInstalled, handleChangeCommitted])

  const childProps: CommitChildProps = {
    commandInstalled,
    handleChangeCommitted,
    step,
    cliArgs,
  }

  if (userInput) return <CommitWithInput {...childProps} />
  else return <CommitWithoutInput {...childProps} />
}

const CommitWithInput = ({
  commandInstalled,
  handleChangeCommitted,
  step,
  cliArgs,
}: CommitChildProps) => {
  useEnterToContinue(handleChangeCommitted, commandInstalled)

  return (
    <CommandList commandLoading={!commandInstalled} step={getExecutorArgument(step, cliArgs)} />
  )
}

const CommitWithoutInput = ({commandInstalled, step, cliArgs}: CommitChildProps) => (
  <CommandList commandLoading={!commandInstalled} step={getExecutorArgument(step, cliArgs)} />
)
