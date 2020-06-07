import {ExecutorConfig, executorArgument, getExecutorArgument, Executor} from './executor'
import {Generator, GeneratorOptions} from '@blitzjs/generator'
import {useEnterToContinue} from '../utils/use-enter-to-continue'
import {useEffect, useState} from 'react'
import * as React from 'react'
import {Box, Text} from 'ink'
import {Newline} from '../components/newline'
import Spinner from 'ink-spinner'

export interface Config extends ExecutorConfig {
  targetDirectory?: executorArgument<string>
  templatePath: executorArgument<string>
  templateValues: executorArgument<{[key: string]: string}>
  destinationPathPrompt?: executorArgument<string>
}

export function isNewFileExecutor(executor: ExecutorConfig): executor is Config {
  return (executor as Config).templatePath !== undefined
}

export const type = 'new-file'

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
    this.targetDirectory = options.targetDirectory || '.'
  }

  getTemplateValues() {
    return this.templateValues
  }

  getTargetDirectory() {
    return this.targetDirectory
  }
}

export const Propose: Executor['Propose'] = ({cliArgs, onProposalAccepted, step}) => {
  const generatorArgs = React.useMemo(
    () => ({
      destinationRoot: '.',
      targetDirectory: getExecutorArgument((step as Config).targetDirectory, cliArgs),
      templateRoot: getExecutorArgument((step as Config).templatePath, cliArgs),
      templateValues: getExecutorArgument((step as Config).templateValues, cliArgs),
      dryRun: true,
    }),
    [cliArgs, step],
  )
  useEnterToContinue(() => {
    onProposalAccepted(generatorArgs)
  })

  const [dryRunOutput, setDryRunOutput] = useState('')

  useEffect(() => {
    async function proposeFileAdditions() {
      if (!dryRunOutput) {
        const dryRunGenerator = new TempGenerator(generatorArgs)
        const results = ((await dryRunGenerator.run()) as unknown) as string
        setDryRunOutput(results)
      }
    }
    proposeFileAdditions()
  }, [dryRunOutput, generatorArgs])

  return (
    <Box flexDirection="column">
      <Text>
        Before creating any new files, we'll do a dry run. Here's a list of files that would be created:
      </Text>
      <Newline />
      {dryRunOutput && <Text>{dryRunOutput}</Text>}
      <Newline />
      <Text>If this looks ok to you, press ENTER to create the files.</Text>
    </Box>
  )
}

export const Commit: Executor['Commit'] = ({cliArgs, onChangeCommitted, step}) => {
  const generatorArgs = React.useMemo(
    () => ({
      destinationRoot: '.',
      targetDirectory: getExecutorArgument((step as Config).targetDirectory, cliArgs),
      templateRoot: getExecutorArgument((step as Config).templatePath, cliArgs),
      templateValues: getExecutorArgument((step as Config).templateValues, cliArgs),
    }),
    [cliArgs, step],
  )
  const [fileCreateOutput, setFileCreateOutput] = useState('')
  const fileCreateLines = fileCreateOutput.split('\n')
  const handleChangeCommitted = React.useCallback(() => {
    onChangeCommitted(
      `Successfully created ${fileCreateLines.map((l) => l.split(' ').slice(1).join('').trim()).join(', ')}`,
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
    createNewFiles()
  }, [fileCreateOutput, generatorArgs])

  return (
    <Box flexDirection="column">
      {!fileCreateOutput && (
        <Text>
          <Spinner /> Creating files...
        </Text>
      )}
      {fileCreateOutput && (
        <>
          {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
          <Text>The file generation is complete! 🎉 Here are the results:</Text>
          <Newline />
          {fileCreateOutput && <Text>{fileCreateOutput}</Text>}
          <Newline />
          <Text>Once you've had a chance to confirm the changes, press ENTER to continue.</Text>
        </>
      )}
    </Box>
  )
}
