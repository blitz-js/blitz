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
import glob from "glob"

export interface Config extends ExecutorConfig {
  selectTargetFiles?(cliArgs: RecipeCLIArgs): any[]
  multi?: boolean
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
  const [diffs, setDiffs] = React.useState<string[] | null>(null)
  const [error, setError] = React.useState<Error | null>(null)
  const [filePaths, setFilePaths] = React.useState<string[]>([])
  const [proposalAccepted, setProposalAccepted] = React.useState(false)

  const acceptProposal = React.useCallback(() => {
    setProposalAccepted(true)
    onProposalAccepted(filePaths)
  }, [onProposalAccepted, filePaths])

  React.useEffect(() => {
    async function generateDiffs() {
      let filesToTransform: string[] = []
      const singleFileSearch = (step as Config).singleFileSearch

      if ((step as Config).multi && typeof singleFileSearch === "string") {
        filesToTransform = glob.sync(singleFileSearch)
      } else {
        filesToTransform = [
          await filePrompt({
            context: cliArgs,
            globFilter: getExecutorArgument(singleFileSearch, cliArgs),
            getChoices: (step as Config).selectTargetFiles,
          }),
        ]
      }

      setFilePaths(filesToTransform)

      const patches = await Promise.all(
        filesToTransform.map(async (fileToTransform) => {
          const originalFile = fs.readFileSync(fileToTransform).toString("utf-8")

          const newFile = await ((step as Config).transformPlain
            ? stringProcessFile(originalFile, (step as Config).transformPlain!)
            : processFile(originalFile, (step as Config).transform!))

          return createPatch(fileToTransform, originalFile, newFile)
        }),
      )

      return patches
    }

    generateDiffs().then(setDiffs, setError)
  }, [cliArgs, step])

  // Let the renderer deal with errors from file transformers, otherwise the
  // process would just hang.
  if (error) throw error

  if (!diffs) {
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
    diffs,
    filePaths,
    proposalAccepted,
    acceptProposal,
  }

  if (userInput) return <ProposeWithInput {...childProps} />
  else return <ProposeWithoutInput {...childProps} />
}

interface ProposeChildProps {
  diffs: string[]
  filePaths: string[]
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
  diffs,
  filePaths,
  proposalAccepted,
  acceptProposal,
}: ProposeChildProps) => {
  useEnterToContinue(acceptProposal, !!filePaths?.length && !proposalAccepted)

  return (
    <Box flexDirection="column">
      {diffs.map((diff, i) => {
        return <Diff diff={diff} key={i} />
      })}
      <EnterToContinue message="The above changes will be made. Press ENTER to continue" />
    </Box>
  )
}

const ProposeWithoutInput = ({
  diffs,
  filePaths,
  proposalAccepted,
  acceptProposal,
}: ProposeChildProps) => {
  React.useEffect(() => {
    if (filePaths?.length && !proposalAccepted) {
      acceptProposal()
    }
  }, [acceptProposal, filePaths, proposalAccepted])

  return (
    <Box flexDirection="column">
      {diffs.map((diff, i) => {
        return <Diff diff={diff} key={i} />
      })}
    </Box>
  )
}

export const Commit: IExecutor["Commit"] = ({onChangeCommitted, proposalData: filePaths, step}) => {
  React.useEffect(() => {
    void (async function () {
      for (let filePath of filePaths) {
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
      }
      onChangeCommitted(`Modified file${filePaths.length > 1 ? "s" : ""}: ${filePaths.join(", ")}`)
    })()
  }, [filePaths, onChangeCommitted, step])

  return (
    <Box>
      <Spinner />
      <Text>Applying file changes</Text>
    </Box>
  )
}
