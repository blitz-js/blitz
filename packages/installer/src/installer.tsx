import * as AddDependencyExecutor from './executors/add-dependency-executor'
import * as NewFileExecutor from './executors/new-file-executor'
import * as FileTransformExecutor from './executors/file-transform-executor'
import {log} from '@blitzjs/display'
// import {logExecutorFrontmatter} from './executors/executor'
import {REGISTER_INSTANCE} from 'ts-node'
import * as React from 'react'
import {render, Box, Text, useApp, useInput} from 'ink'
import {Executor, Frontmatter} from './executors/executor'
import {Newline} from './components/newline'
import {Branded} from './components/branded'

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
  beforeEach?(stepId: string | number): Promise<void>
  afterEach?(stepId: string | number): Promise<void>
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
  steps: {executor: ExecutorConfig; status: Status}[]
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
      break
    case Action.ApplyChange:
      newState.steps[newState.current].status = Status.Committing
      break
    case Action.CompleteChange:
      newState.steps[newState.current].status = Status.Committed
      newState.current += 1
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

function StepExecutor({cliArgs, step, status}: {step: ExecutorConfig; status: Status; cliArgs: any}) {
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
        <Commit cliArgs={cliArgs} step={step} onChangeCommitted={handleChangeCommitted} />
      )}
    </Box>
  )
}

class EB extends React.Component<{}, {error?: Error; errorInfo?: any}> {
  state = {
    error: undefined,
    errorInfo: undefined,
  }

  static getDerivedStateFromError(error: Error, errorInfo: any) {
    return {error, errorInfo}
  }
  render() {
    return this.state.error || this.state.errorInfo ? (
      <Box>
        {this.state.error}
        {this.state.errorInfo}
      </Box>
    ) : (
      this.props.children
    )
  }
}

function RecipeRenderer({cliArgs, steps, recipeMeta}: RecipeProps) {
  const {exit} = useApp()
  const [state, dispatch] = React.useReducer(installerState, {
    ...initialState,
    steps: steps.map((e) => ({executor: e, status: Status.Pending})),
  })

  if (state.current === state.steps.length && state.steps[state.current].status === Status.Committed) {
    exit()
  }

  useInput((_input, key) => {
    if (key.return) {
      if (state.current === -1) {
        // force the executor into the first step
        dispatch({type: Action.SkipStep})
      }
    }
  })

  if (state.current === -1) {
    return <WelcomeMessage recipeMeta={recipeMeta} />
  }

  return (
    <EB>
      <DispatchContext.Provider value={dispatch}>
        <StepExecutor
          cliArgs={cliArgs}
          step={state.steps[state.current].executor}
          status={state.steps[state.current].status}
        />
      </DispatchContext.Provider>
    </EB>
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
  // private async beforeEach(stepId: string | number): Promise<void> {
  //   if (this.options.beforeEach) return this.options.beforeEach(stepId)
  // }
  // private async afterEach(stepId: string | number): Promise<void> {
  //   if (this.options.afterEach) return this.options.afterEach(stepId)
  // }
  private async postInstall(): Promise<void> {
    if (this.options.postInstall) return this.options.postInstall()
  }

  // async displayFrontmatter() {
  //   log.branded(`Welcome to the installer for ${this.options.packageName}`)
  //   log.branded(this.options.packageDescription)
  //   log.info(`This package is authored and supported by ${this.options.packageOwner}`)
  //   log.info(`For additional documentation and support please visit ${this.options.packageRepoLink}`)
  //   console.log()
  //   await waitForConfirmation('Press enter to begin installation')
  // }

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
    // await this.displayFrontmatter()
    // for (const step of this.steps) {
    //   console.log() // newline

    //   await this.beforeEach(step.stepId)

    //   logExecutorFrontmatter(step)

    //   // using if instead of a switch allows us to strongly type the executors
    //   if (isFileTransformExecutor(step)) {
    //     await fileTransformExecutor(step, cliArgs)
    //   } else if (isAddDependencyExecutor(step)) {
    //     await addDependencyExecutor(step, cliArgs)
    //   } else if (isNewFileExecutor(step)) {
    //     await newFileExecutor(step, cliArgs)
    //   }

    //   await this.afterEach(step.stepId)
    // }
    await this.postInstall()

    console.log()
    log.success(`Installer complete, ${this.options.packageName} is now be configured for your app!`)
  }
}
