import {Generator, GeneratorOptions} from "@blitzjs/generator"
import {Box, Text} from "ink"
import {useEffect, useState} from "react"
import * as React from "react"
import {Newline} from "../components/newline"
import {useEnterToContinue} from "../utils/use-enter-to-continue"
import {Executor, executorArgument, ExecutorConfig, getExecutorArgument} from "./executor"

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
}

class TempGenerator extends Generator<TempGeneratorOptions> {
  sourceRoot: string
  targetDirectory: string
  templateValues: any
  returnResults = true

  constructor(options: TempGeneratorOptions) {
    super(options)
    this.sourceRoot = options.templateRoot
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

export const Commit: Executor["Commit"] = ({cliArgs, onChangeCommitted, step}) => {
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
  const fileCreateLines = fileCreateOutput.split("\n")
  const handleChangeCommitted = React.useCallback(() => {
    onChangeCommitted(
      `Successfully created ${fileCreateLines
        .map((l) => l.split(" ").slice(1).join("").trim())
        .join(", ")}`,
    )
  }, [fileCreateLines, onChangeCommitted])

  useEnterToContinue(handleChangeCommitted)

  useEffect(() => {
    async function createNewFiles() {
      if (!fileCreateOutput) {
        const generator = new TempGenerator(generatorArgs)
        const results = ((await generator.run()) as unknown) as string
        setFileCreateOutput(results)
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    createNewFiles()
  }, [fileCreateOutput, generatorArgs])

  return (
    <Box flexDirection="column">
      {fileCreateOutput ? (
        <>
          {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
          {fileCreateOutput ? <Text>{fileCreateOutput}</Text> : null}
          <Newline />
          <Text bold>Press ENTER to continue</Text>
        </>
      ) : null}
    </Box>
  )
}
