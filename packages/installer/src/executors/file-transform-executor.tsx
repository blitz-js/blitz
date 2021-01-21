import {createPatch} from "diff"
import * as fs from "fs-extra"
import {Box, Text} from "ink"
import Spinner from "ink-spinner"
import * as React from "react"
import {Newline} from "../components/newline"
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
  selectTargetFiles?(cliArgs: any): any[]
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
export const Propose: Executor["Propose"] = ({cliArgs, onProposalAccepted, step}) => {
  const [diff, setDiff] = React.useState<string | null>(null)
  const filePathRef = React.useRef("")
  useEnterToContinue(() => onProposalAccepted(filePathRef.current), !!filePathRef.current)

  React.useEffect(() => {
    async function generateDiff() {
      const fileToTransform: string = await filePrompt({
        context: cliArgs,
        globFilter: getExecutorArgument((step as Config).singleFileSearch, cliArgs),
        getChoices: (step as Config).selectTargetFiles,
      })
      filePathRef.current = fileToTransform
      const originalFile = fs.readFileSync(fileToTransform).toString("utf-8")
      const newFile = (step as Config).transformPlain
        ? stringProcessFile(originalFile, (step as Config).transformPlain!)
        : processFile(originalFile, (step as Config).transform!)
      return createPatch(fileToTransform, originalFile, newFile)
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    generateDiff().then(setDiff)
  }, [cliArgs, step])

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
      <Newline />
      <Text>
        The above diff will be applied. If it looks okay to you, hit ENTER to apply the changes!
      </Text>
    </Box>
  )
}
export const Commit: Executor["Commit"] = ({onChangeCommitted, proposalData: filePath, step}) => {
  const [loading, setLoading] = React.useState(true)

  const handleChangeCommitted = React.useCallback(() => {
    onChangeCommitted(`Modified 1 file: ${filePath}`)
  }, [filePath, onChangeCommitted])

  useEnterToContinue(handleChangeCommitted, !loading)

  React.useEffect(() => {
    const results = transform(
      (original) =>
        (step as Config).transformPlain
          ? stringProcessFile(original, (step as Config).transformPlain!)
          : processFile(original, (step as Config).transform!),
      [filePath],
    )
    if (results.some((r) => r.status === TransformStatus.Failure)) {
      console.error(results)
    }
    setLoading(false)
  }, [filePath, step])

  if (loading) {
    return (
      <Box>
        <Spinner />
        <Text>Applying file changes</Text>
      </Box>
    )
  }
  return (
    <Box paddingBottom={1} flexDirection="column">
      {/* Stop ESlint from complaining about the emoji */}
      {/* eslint-disable-next-line */}
      <Text>📝 File changes applied! Press ENTER to continue</Text>
    </Box>
  )
}
