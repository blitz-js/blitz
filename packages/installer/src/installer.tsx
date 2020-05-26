import * as AddDependencyExecutor from './executors/add-dependency-executor'
import * as NewFileExecutor from './executors/new-file-executor'
import * as FileTransformExecutor from './executors/file-transform-executor'
import {log} from '@blitzjs/display'
// import {logExecutorFrontmatter} from './executors/executor'
import {REGISTER_INSTANCE} from 'ts-node'
import * as React from 'react'
import {render, Box, Text, useApp} from 'ink'
import {Executor, Frontmatter} from './executors/executor'
import {Newline} from './components/newline'
import {Branded} from './components/branded'
import {useEnterToContinue} from './utils/use-enter-to-continue'

export const setupTsNode = () => {
  if (!process[REGISTER_INSTANCE]) {
    // During blitz interal dev, oclif automaticaly sets up ts-node so we have to check
    require('ts-node').register({compilerOptions: {module: 'commonjs'}})
  }
  require('tsconfig-paths/register')
}

const ExecutorMap: {[key: string]: Executor} = {
  [AddDependencyExecutor.type]: AddDependencyExecutor,
  [NewFileExecutor.type]: NewFileExecutor,
  [FileTransformExecutor.type]: FileTransformExecutor,
} as const

type ExecutorConfig = AddDependencyExecutor.Config | FileTransformExecutor.Config | NewFileExecutor.Config

interface RecipeMeta {
  packageName: string
  packageDescription: string
  packageOwner: string
  packageRepoLink: string
  validateArgs?(args: {}): Promise<void>
  preInstall?(): Promise<void>
  postInstall?(): Promise<void>
}

enum Action {
  SkipStep,
  ProposeChange,
  ApplyChange,
  CommitApproved,
  CompleteChange,
}

enum Status {
  Pending,
  Proposed,
  ReadyToCommit,
  Committing,
  Committed,
}

interface State {
  steps: {executor: ExecutorConfig; status: Status; proposalData?: any}[]
  current: number
}

const initialState: State = {
  steps: [],
  current: -1,
}

function installerState(state = initialState, action: {type: Action; data?: any}) {
  const newState = {...state}
  switch (action.type) {
    case Action.ProposeChange:
      newState.steps[newState.current].status = Status.Proposed
      break
    case Action.CommitApproved:
      newState.steps[newState.current].status = Status.ReadyToCommit
      newState.steps[newState.current].proposalData = action.data
      break
    case Action.ApplyChange:
      newState.steps[newState.current].status = Status.Committing
      break
    case Action.CompleteChange:
      newState.steps[newState.current].status = Status.Committed
      newState.current = Math.min(newState.current + 1, newState.steps.length - 1)
      break
    case Action.SkipStep:
      newState.current += 1
      break
  }
  return newState
}

interface RecipeProps {
  cliArgs: any
  steps: ExecutorConfig[]
  recipeMeta: RecipeMeta
}

const DispatchContext = React.createContext<React.Dispatch<{type: Action; data?: any}>>(() => {})

function WelcomeMessage({recipeMeta}: {recipeMeta: RecipeMeta}) {
  return (
    <Box flexDirection="column">
      <Branded>
        <Box flexDirection="column">
          <Text>Welcome to the recipe for {recipeMeta.packageName}</Text>
          <Text>{recipeMeta.packageDescription}</Text>
        </Box>
      </Branded>
      <Text bold={false}>This recipe is authored and supported by {recipeMeta.packageOwner}.</Text>
      <Text>For additional documentation and support please visit {recipeMeta.packageRepoLink}</Text>
      <Newline />
      <Text>Press ENTER to begin the recipe</Text>
    </Box>
  )
}

function StepExecutor({
  cliArgs,
  proposalData,
  step,
  status,
}: {
  step: ExecutorConfig
  status: Status
  cliArgs: any
  proposalData?: any
}) {
  const {Propose, Commit}: Executor = ExecutorMap[step.stepType]
  const dispatch = React.useContext(DispatchContext)

  const handleProposalAccepted = React.useCallback(
    (msg) => {
      dispatch({type: Action.CommitApproved, data: msg})
    },
    [dispatch],
  )
  const handleChangeCommitted = React.useCallback(
    (msg) => {
      dispatch({type: Action.CompleteChange, data: msg})
    },
    [dispatch],
  )

  React.useEffect(() => {
    if (status === Status.Pending) {
      dispatch({type: Action.ProposeChange})
    } else if (status === Status.ReadyToCommit) {
      dispatch({type: Action.ApplyChange})
    }
  }, [dispatch, status])

  return (
    <Box flexDirection="column">
      <Frontmatter executor={step} />
      {[Status.Pending, Status.Proposed].includes(status) && (
        <Propose cliArgs={cliArgs} step={step} onProposalAccepted={handleProposalAccepted} />
      )}
      {[Status.ReadyToCommit, Status.Committing].includes(status) && (
        <Commit
          cliArgs={cliArgs}
          proposalData={proposalData}
          step={step}
          onChangeCommitted={handleChangeCommitted}
        />
      )}
    </Box>
  )
}

function RecipeRenderer({cliArgs, steps, recipeMeta}: RecipeProps) {
  const {exit} = useApp()
  const [state, dispatch] = React.useReducer(installerState, {
    ...initialState,
    steps: steps.map((e) => ({executor: e, status: Status.Pending})),
  })

  useEnterToContinue(() => dispatch({type: Action.SkipStep}), state.current === -1)

  React.useEffect(() => {
    if (state.current === state.steps.length - 1 && state.steps[state.current].status === Status.Committed) {
      exit()
    }
  })

  if (state.current === -1) {
    return <WelcomeMessage recipeMeta={recipeMeta} />
  }

  return (
    <DispatchContext.Provider value={dispatch}>
      <StepExecutor
        cliArgs={cliArgs}
        proposalData={state.steps[state.current]?.proposalData}
        step={state.steps[state.current]?.executor}
        status={state.steps[state.current]?.status}
      />
    </DispatchContext.Provider>
  )
}

export class Installer<Options extends RecipeMeta> {
  private readonly steps: ExecutorConfig[]
  private readonly options: Options

  constructor(options: Options, steps: ExecutorConfig[]) {
    this.options = options
    this.steps = steps
    setupTsNode()
  }

  private async validateArgs(cliArgs: {}): Promise<void> {
    if (this.options.validateArgs) return this.options.validateArgs(cliArgs)
  }
  private async preInstall(): Promise<void> {
    if (this.options.preInstall) return this.options.preInstall()
  }
  private async postInstall(): Promise<void> {
    if (this.options.postInstall) return this.options.postInstall()
  }

  async run(cliArgs: {}): Promise<void> {
    try {
      await this.validateArgs(cliArgs)
    } catch (err) {
      log.error(err)
      return
    }
    await this.preInstall()
    try {
      const {waitUntilExit} = render(
        <RecipeRenderer cliArgs={cliArgs} steps={this.steps} recipeMeta={this.options} />,
        {
          experimental: true,
        },
      )
      await waitUntilExit()
    } catch (e) {
      console.error(e)
    }
    await this.postInstall()

    console.log()
    log.success(
      `The recipe for ${this.options.packageName} completed successfully! Its functionality is now fully configured in your Blitz app.`,
    )
  }
}
