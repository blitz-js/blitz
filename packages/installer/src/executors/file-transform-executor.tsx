import {ExecutorConfig, executorArgument, getExecutorArgument, Executor} from './executor'
import {filePrompt} from './file-prompt'
import {processFile, transform, Transformer, TransformStatus} from '../utils/transform'
import {log} from '@blitzjs/display'
import {waitForConfirmation} from '../utils/wait-for-confirmation'
import {createPatch} from 'diff'
import chokidar from 'chokidar'
import * as fs from 'fs-extra'
import * as React from 'react'
import Spinner from 'ink-spinner'
import {Box, Text, Color} from 'ink'
import {Newline} from '../components/newline'
import {useEnterToContinue} from '../utils/use-enter-to-continue'

export interface Config extends ExecutorConfig {
  selectTargetFiles?(cliArgs: any): any[]
  singleFileSearch?: executorArgument<string>
  transform: Transformer
}

export function isFileTransformExecutor(executor: ExecutorConfig): executor is Config {
  return (executor as Config).transform !== undefined
}

export const type = 'file-transform'
export const Propose: Executor['Propose'] = ({cliArgs, onProposalAccepted, step}) => {
  const [diff, setDiff] = React.useState<string | null>(null)
  const filePathRef = React.useRef('')
  useEnterToContinue(() => onProposalAccepted(filePathRef.current), !!filePathRef.current)

  React.useEffect(() => {
    async function generateDiff() {
      const fileToTransform: string = await filePrompt({
        context: cliArgs,
        globFilter: getExecutorArgument((step as Config).singleFileSearch, cliArgs),
        getChoices: (step as Config).selectTargetFiles,
      })
      filePathRef.current = fileToTransform
      const originalFile = fs.readFileSync(fileToTransform).toString('utf-8')
      const newFile = processFile(originalFile, (step as Config).transform)
      return createPatch(fileToTransform, originalFile, newFile)
    }
    generateDiff().then(setDiff)
  }, [cliArgs, step])

  if (!diff) {
    return (
      <Box>
        <Spinner /> Generating file diff...
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      {diff
        .split('\n')
        .slice(2)
        .map((line, idx) => {
          let styleProps: any = {}
          let colorProps: any = {}
          if (line.startsWith('-') && !line.startsWith('---')) {
            styleProps.bold = true
            colorProps.red = true
          } else if (line.startsWith('+') && !line.startsWith('+++')) {
            styleProps.bold = true
            colorProps.green = true
          }

          return (
            <Color {...colorProps} key={idx}>
              <Text {...styleProps}>{line}</Text>
            </Color>
          )
        })}
      <Newline />
      <Text>The above diff will be applied. If it looks okay to you, hit ENTER to apply the changes!</Text>
    </Box>
  )
}
export const Commit: Executor['Commit'] = ({onChangeCommitted, proposalData: filePath, step}) => {
  const transformFn = (step as Config).transform

  const [loading, setLoading] = React.useState(true)
  useEnterToContinue(onChangeCommitted, !loading)

  React.useEffect(() => {
    const results = transform(transformFn, [filePath])
    if (results.some((r) => r.status === TransformStatus.Failure)) {
      console.error(results)
    }
    setLoading(false)
  }, [filePath, transformFn])

  if (loading) {
    return (
      <Box>
        <Spinner /> Applying file changes
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

async function executeWithDiff(transformFn: Transformer, filePath: string) {
  await new Promise((res, rej) => {
    const watcher = chokidar.watch(filePath)
    const originalFileContents = fs.readFileSync(filePath).toString('utf-8')
    watcher.on('change', (path) => {
      watcher.close().then(() => {
        const patch = createPatch(path, originalFileContents, fs.readFileSync(path).toString('utf-8'))
        patch.split('\n').slice(2)
        res(path)
      })
    })
    watcher.on('error', (error) => {
      rej(error)
    })
    transform(transformFn, [filePath])
  })
}

export async function fileTransformExecutor(executor: Config, cliArgs: any): Promise<void> {
  const fileToTransform: string = await filePrompt({
    context: cliArgs,
    globFilter: getExecutorArgument(executor.singleFileSearch, cliArgs),
    getChoices: executor.selectTargetFiles,
  })
  try {
    await executeWithDiff(executor.transform, fileToTransform)
    await waitForConfirmation('The above changes were applied. Press enter to continue')
  } catch (err) {
    log.error(`Failed to transform ${fileToTransform}`)
  }
}
