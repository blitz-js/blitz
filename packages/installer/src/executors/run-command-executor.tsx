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
  command: CliCommand
  cliArgs: RecipeCLIArgs
  step: Config
}

export const type = "run-command"

function Command({command, loading}: {command: CliCommand; loading: boolean}) {
  return (
    <Text>
      {`   `}
      {loading ? <Spinner /> : "✅"}
      {` ${command.command}`} {` ${command.commandArgs?.join(" ")}`}
    </Text>
  )
}

const CommandList = ({
  lede = "Hang tight! Running...",
  commandLoading = false,
  step,
  command,
}: {
  lede?: string
  commandLoading?: boolean
  step: Config
  command: CliCommand
}) => {
  return (
    <Box flexDirection="column">
      <Text>{lede}</Text>
      <Newline />
      <Command key={step.stepId} command={command} loading={commandLoading} />
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
  const executorCommand = getExecutorArgument((step as Config).command, cliArgs)

  const handleChangeCommitted = React.useCallback(() => {
    onChangeCommitted(`Executed command`)
  }, [onChangeCommitted])

  React.useEffect(() => {
    async function runCommand() {
      const command = executorCommand.command
      const commandArgs = executorCommand.commandArgs
      await executeCommand(command, commandArgs)
      setCommandInstalled(true)
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    runCommand()
  }, [cliArgs, step, executorCommand])

  React.useEffect(() => {
    if (commandInstalled) {
      handleChangeCommitted()
    }
  }, [commandInstalled, handleChangeCommitted])

  const childProps: CommitChildProps = {
    commandInstalled,
    handleChangeCommitted,
    command: executorCommand,
    cliArgs,
    step: step as Config,
  }

  if (userInput) return <CommitWithInput {...childProps} />
  else return <CommitWithoutInput {...childProps} />
}

const CommitWithInput = ({
  commandInstalled,
  handleChangeCommitted,
  command,
  step,
}: CommitChildProps) => {
  useEnterToContinue(handleChangeCommitted, commandInstalled)

  return <CommandList commandLoading={!commandInstalled} step={step} command={command} />
}

const CommitWithoutInput = ({commandInstalled, command, step}: CommitChildProps) => (
  <CommandList commandLoading={!commandInstalled} step={step} command={command} />
)
