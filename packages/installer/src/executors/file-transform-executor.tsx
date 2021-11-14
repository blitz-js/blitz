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
import {Executor, executorArgument, ExecutorConfig, getExecutorArgument} from "./executor"
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
export const Propose: Executor["Propose"] = ({cliArgs, cliFlags, onProposalAccepted, step}) => {
  const [diff, setDiff] = React.useState<string | null>(null)
  const [error, setError] = React.useState<Error | null>(null)
  const [filePath, setFilePath] = React.useState("")
  const [proposalAccepted, setProposalAccepted] = React.useState(false)

  const acceptProposal = React.useCallback(() => {
    setProposalAccepted(true)
    onProposalAccepted(filePath)
  }, [onProposalAccepted, filePath])

  useEnterToContinue(acceptProposal, filePath !== "" && !proposalAccepted && !cliFlags.yesToAll)

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

  React.useEffect(() => {
    if (filePath !== "" && !proposalAccepted && cliFlags.yesToAll) {
      acceptProposal()
    }
  }, [acceptProposal, cliFlags.yesToAll, filePath, proposalAccepted])

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

  return (
    <Box flexDirection="column">
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
      {!cliFlags.yesToAll && (
        <EnterToContinue message="The above changes will be made. Press ENTER to continue" />
      )}
    </Box>
  )
}
export const Commit: Executor["Commit"] = ({onChangeCommitted, proposalData: filePath, step}) => {
  const [loading, setLoading] = React.useState(true)

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
      setLoading(false)
    })()
  }, [filePath, step])

  if (loading) {
    return (
      <Box>
        <Spinner />
        <Text>Applying file changes</Text>
      </Box>
    )
  }

  onChangeCommitted(`Modified file: ${filePath}`)
  return null
}
