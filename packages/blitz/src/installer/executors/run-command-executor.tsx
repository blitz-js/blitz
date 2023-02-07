import {spawn} from "cross-spawn"
import {Box, Text} from "ink"
import Spinner from "ink-spinner"
import * as React from "react"
import {Newline} from "../components/newline"
import {RecipeCLIArgs} from "../types"
import {useEnterToContinue} from "../utils/use-enter-to-continue"
import {useUserInput} from "../utils/use-user-input"
import {IExecutor, ExecutorConfig, getExecutorArgument} from "./executor"

export type CliCommand = string | [string, ...string[]]

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
      {` ${typeof command === "string" ? command : command.join(" ")}`}
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
 * INFO: Exported for unit testing purposes
 *
 * This function calls the defined command with their optional arguments if defined
 *
 * @param {CliCommand} input  The Command and arguments
 * @return Promise<void>
 *
 * @example await executeCommand("ls")
 * @example await executeCommand(["ls"])
 * @example await executeCommand(["ls", ...["-a", "-l"]])
 */
export async function executeCommand(input: CliCommand): Promise<void> {
  // from https://stackoverflow.com/a/43766456/9950655
  const argsRegex =
    /("[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^/\\]*(?:\\[\S\s][^/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S)+)/g
  const command: string[] = Array.isArray(input) ? input : input.match(argsRegex) || []

  if (command.length === 0) {
    throw new Error(`The command is too short: \`${JSON.stringify(input)}\``)
  }

  await new Promise((resolve) => {
    const cp = spawn(`${command[0]}`, command.slice(1), {
      stdio: ["inherit", "pipe", "pipe"],
    })
    cp.on("exit", resolve)
    cp.stdout.on("data", () => {})
  })
}

export const Commit: IExecutor["Commit"] = ({cliArgs, cliFlags, step, onChangeCommitted}) => {
  const userInput = useUserInput(cliFlags)
  const [commandInstalled, setCommandInstalled] = React.useState(false)
  const executorCommand = getExecutorArgument((step as Config).command, cliArgs)

  const handleChangeCommitted = React.useCallback(() => {
    onChangeCommitted(`Executed command ${executorCommand}`)
  }, [executorCommand, onChangeCommitted])

  React.useEffect(() => {
    async function runCommand() {
      await executeCommand(executorCommand)
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
