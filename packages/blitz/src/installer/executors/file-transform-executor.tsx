import {createPatch} from "diff"
import * as fs from "fs-extra"
import {Box, Text} from "ink"
import Spinner from "ink-spinner"
import * as React from "react"
import {EnterToContinue} from "../components/enter-to-continue"
import {RecipeCLIArgs} from "../types"
import {
  processFile,
  stringProcessFile,
  StringTransformer,
  transform,
  Transformer,
  TransformStatus,
} from "../utils/transform"
import {useEnterToContinue} from "../utils/use-enter-to-continue"
import {useUserInput} from "../utils/use-user-input"
import {IExecutor, executorArgument, ExecutorConfig, getExecutorArgument} from "./executor"
import {filePrompt} from "./file-prompt"

export interface Config extends ExecutorConfig {
  selectTargetFiles?(cliArgs: RecipeCLIArgs): any[]
  singleFileSearch?: executorArgument<string>
  transform?: Transformer
  transformPlain?: StringTransformer
}

export function isFileTransformExecutor(executor: ExecutorConfig): executor is Config {
  return (
    (executor as Config).transform !== undefined ||
    (executor as Config).transformPlain !== undefined
  )
}

export const type = "file-transform"
export const Propose: IExecutor["Propose"] = ({cliArgs, cliFlags, onProposalAccepted, step}) => {
  const userInput = useUserInput(cliFlags)
  const [diff, setDiff] = React.useState<string | null>(null)
  const [error, setError] = React.useState<Error | null>(null)
  const [filePath, setFilePath] = React.useState("")
  const [proposalAccepted, setProposalAccepted] = React.useState(false)

  const acceptProposal = React.useCallback(() => {
    setProposalAccepted(true)
    onProposalAccepted(filePath)
  }, [onProposalAccepted, filePath])

  React.useEffect(() => {
    async function generateDiff() {
      const fileToTransform: string = await filePrompt({
        context: cliArgs,
        globFilter: getExecutorArgument((step as Config).singleFileSearch, cliArgs),
        getChoices: (step as Config).selectTargetFiles,
      })

      setFilePath(fileToTransform)
      const originalFile = fs.readFileSync(fileToTransform).toString("utf-8")

      const newFile = await ((step as Config).transformPlain
        ? stringProcessFile(originalFile, (step as Config).transformPlain!)
        : processFile(originalFile, (step as Config).transform!))

      return createPatch(fileToTransform, originalFile, newFile)
    }

    generateDiff().then(setDiff, setError)
  }, [cliArgs, step])

  // Let the renderer deal with errors from file transformers, otherwise the
  // process would just hang.
  if (error) throw error

  if (!diff) {
    return (
      <Box>
        <Text>
          <Spinner />
          Generating file diff...
        </Text>
      </Box>
    )
  }

  const childProps: ProposeChildProps = {
    diff,
    filePath,
    proposalAccepted,
    acceptProposal,
  }

  if (userInput) return <ProposeWithInput {...childProps} />
  else return <ProposeWithoutInput {...childProps} />
}

interface ProposeChildProps {
  diff: string
  filePath: string
  proposalAccepted: boolean
  acceptProposal: () => void
}

const Diff = ({diff}: {diff: string}) => (
  <>
    {diff
      .split("\n")
      .slice(2)
      .map((line, idx) => {
        let styleProps: any = {}
        if (line.startsWith("-") && !line.startsWith("---")) {
          styleProps.bold = true
          styleProps.color = "red"
        } else if (line.startsWith("+") && !line.startsWith("+++")) {
          styleProps.bold = true
          styleProps.color = "green"
        }
        return (
          <Text {...styleProps} key={idx}>
            {line}
          </Text>
        )
      })}
  </>
)

const ProposeWithInput = ({
  diff,
  filePath,
  proposalAccepted,
  acceptProposal,
}: ProposeChildProps) => {
  useEnterToContinue(acceptProposal, filePath !== "" && !proposalAccepted)

  return (
    <Box flexDirection="column">
      <Diff diff={diff} />
      <EnterToContinue message="The above changes will be made. Press ENTER to continue" />
    </Box>
  )
}

const ProposeWithoutInput = ({
  diff,
  filePath,
  proposalAccepted,
  acceptProposal,
}: ProposeChildProps) => {
  React.useEffect(() => {
    if (filePath !== "" && !proposalAccepted) {
      acceptProposal()
    }
  }, [acceptProposal, filePath, proposalAccepted])

  return (
    <Box flexDirection="column">
      <Diff diff={diff} />
    </Box>
  )
}

export const Commit: IExecutor["Commit"] = ({onChangeCommitted, proposalData: filePath, step}) => {
  React.useEffect(() => {
    void (async function () {
      const results = await transform(
        async (original) =>
          await ((step as Config).transformPlain
            ? stringProcessFile(original, (step as Config).transformPlain!)
            : processFile(original, (step as Config).transform!)),
        [filePath],
      )
      if (results.some((r) => r.status === TransformStatus.Failure)) {
        console.error(results)
      }
      onChangeCommitted(`Modified file: ${filePath}`)
    })()
  }, [filePath, onChangeCommitted, step])

  return (
    <Box>
      <Spinner />
      <Text>Applying file changes</Text>
    </Box>
  )
}
