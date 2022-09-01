import {Generator, GeneratorOptions, SourceRootType} from "@blitzjs/generator"
import {Box, Text} from "ink"
import {useEffect, useState} from "react"
import * as React from "react"
import {EnterToContinue} from "../components/enter-to-continue"
import {useEnterToContinue} from "../utils/use-enter-to-continue"
import {useUserInput} from "../utils/use-user-input"
import {IExecutor, executorArgument, ExecutorConfig, getExecutorArgument} from "./executor"

export interface Config extends ExecutorConfig {
  targetDirectory?: executorArgument<string>
  templatePath: executorArgument<string>
  templateValues: executorArgument<{[key: string]: string}>
  destinationPathPrompt?: executorArgument<string>
}

export function isNewFileExecutor(executor: ExecutorConfig): executor is Config {
  return (executor as Config).templatePath !== undefined
}

export const type = "new-file"

interface TempGeneratorOptions extends GeneratorOptions {
  targetDirectory?: string
  templateRoot: string
  templateValues: any
  run?: any
}

class TempGenerator extends Generator<TempGeneratorOptions> {
  sourceRoot: SourceRootType
  targetDirectory: string
  templateValues: any
  returnResults = true

  constructor(options: TempGeneratorOptions) {
    super(options)
    this.sourceRoot = {type: "absolute", path: options.templateRoot}
    this.templateValues = options.templateValues
    this.targetDirectory = options.targetDirectory || "."
  }

  getTemplateValues() {
    return this.templateValues
  }

  getTargetDirectory() {
    return this.targetDirectory
  }
}

export const Commit: IExecutor["Commit"] = ({cliArgs, cliFlags, onChangeCommitted, step}) => {
  const userInput = useUserInput(cliFlags)
  const generatorArgs = React.useMemo(
    () => ({
      destinationRoot: ".",
      targetDirectory: getExecutorArgument((step as Config).targetDirectory, cliArgs),
      templateRoot: getExecutorArgument((step as Config).templatePath, cliArgs),
      templateValues: getExecutorArgument((step as Config).templateValues, cliArgs),
    }),
    [cliArgs, step],
  )
  const [fileCreateOutput, setFileCreateOutput] = useState("")
  const [changeCommited, setChangeCommited] = useState(false)
  const fileCreateLines = fileCreateOutput.split("\n")
  const handleChangeCommitted = React.useCallback(() => {
    setChangeCommited(true)
    onChangeCommitted(
      `Successfully created ${fileCreateLines
        .map((l) => l.split(" ").slice(1).join("").trim())
        .join(", ")}`,
    )
  }, [fileCreateLines, onChangeCommitted])

  useEffect(() => {
    async function createNewFiles() {
      if (!fileCreateOutput) {
        const generator = new TempGenerator(generatorArgs)
        const results = (await generator.run()) as unknown as string
        setFileCreateOutput(results)
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    createNewFiles()
  }, [fileCreateOutput, generatorArgs])

  const childProps: CommitChildProps = {
    changeCommited,
    fileCreateOutput,
    handleChangeCommitted,
  }

  if (userInput) return <CommitWithInput {...childProps} />
  else return <CommitWithoutInput {...childProps} />
}

interface CommitChildProps {
  changeCommited: boolean
  fileCreateOutput: string
  handleChangeCommitted: () => void
}

const CommitWithInput = ({
  changeCommited,
  fileCreateOutput,
  handleChangeCommitted,
}: CommitChildProps) => {
  useEnterToContinue(handleChangeCommitted, !changeCommited && fileCreateOutput !== "")

  return (
    <Box flexDirection="column">
      {fileCreateOutput !== "" && (
        <>
          <Text>{fileCreateOutput}</Text>
          <EnterToContinue />
        </>
      )}
    </Box>
  )
}

const CommitWithoutInput = ({
  changeCommited,
  fileCreateOutput,
  handleChangeCommitted,
}: CommitChildProps) => {
  React.useEffect(() => {
    if (!changeCommited && fileCreateOutput !== "") {
      handleChangeCommitted()
    }
  }, [changeCommited, fileCreateOutput, handleChangeCommitted])

  return (
    <Box flexDirection="column">{fileCreateOutput !== "" && <Text>{fileCreateOutput}</Text>}</Box>
  )
}
