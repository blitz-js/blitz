import * as AddDependencyExecutor from './executors/add-dependency-executor'
import * as NewFileExecutor from './executors/new-file-executor'
import * as FileTransformExecutor from './executors/file-transform-executor'
import {log} from '@blitzjs/display'
// import {logExecutorFrontmatter} from './executors/executor'
import {waitForConfirmation} from './utils/wait-for-confirmation'
import {REGISTER_INSTANCE} from 'ts-node'
import * as React from 'react'
import {render, Box, Text, Color, useApp} from 'ink'

export const setupTsNode = () => {
  if (!process[REGISTER_INSTANCE]) {
    // During blitz interal dev, oclif automaticaly sets up ts-node so we have to check
    require('ts-node').register({compilerOptions: {module: 'commonjs'}})
  }
  require('tsconfig-paths/register')
}

interface Executor {
  type: String
  Propose: React.FC<{step: ExecutorConfig; onProposeComplete: (msg: string) => void}>
  Commit: React.FC<{step: ExecutorConfig; onChangeCommitted: (msg: string) => void}>
}

const ExecutorMap: {[key: string]: Executor} = {
  [AddDependencyExecutor.type]: AddDependencyExecutor,
  [NewFileExecutor.type]: NewFileExecutor,
  [FileTransformExecutor.type]: FileTransformExecutor,
} as const

type ExecutorConfig = AddDependencyExecutor.Config | FileTransformExecutor.Config | NewFileExecutor.Config

interface InstallerOptions {
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
  switch (action.type) {
    case Action.ProposeChange:
      state.steps[state.current].status = Status.Proposed
      break
    case Action.CommitApproved:
      state.steps[state.current].status = Status.ReadyToCommit
      break
    case Action.ApplyChange:
      state.steps[state.current].status = Status.Committing
      break
    case Action.CompleteChange:
      state.steps[state.current].status = Status.Committed
      state.current += 1
      break
  }
  return state
}

interface InstallerProps {
  steps: ExecutorConfig[]
  recipeMeta: InstallerOptions
}

const Brand: React.FC = ({children}) => (
  <Color hex="8a3df0" bold={true}>
    {children}
  </Color>
)

function Newline({count = 1}) {
  return <Text>{'\n'.repeat(count)}</Text>
}

const DispatchContext = React.createContext<React.Dispatch<{type: Action; data?: any}>>(() => {})

function WelcomeMessage({recipeMeta}: {recipeMeta: InstallerOptions}) {
  return (
    <Box marginBottom={2}>
      <Brand>
        Welcome to the recipe for {recipeMeta.packageName}
        <Newline />
        {recipeMeta.packageDescription}
        <Newline />
        <Text bold={false}>
          This recipe is authored and supported by {recipeMeta.packageOwner}. For additional documentation and
          support please visit {recipeMeta.packageRepoLink}
        </Text>
        <Newline />
      </Brand>
    </Box>
  )
}

function StepExecutor({step, status}: {step: ExecutorConfig; status: Status}) {
  const {Propose, Commit}: Executor = ExecutorMap[step.stepType]
  const dispatch = React.useContext(DispatchContext)

  const handleProposeComplete = React.useCallback(
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

  if (status === Status.Pending) {
    return <Propose step={step} onProposeComplete={handleProposeComplete} />
  }
  if (status === Status.ReadyToCommit) {
    return <Commit step={step} onChangeCommitted={handleChangeCommitted} />
  }

  return <Box />
}

function InstallerRenderer({steps, recipeMeta}: InstallerProps) {
  const {exit} = useApp()
  const [state, dispatch] = React.useReducer(installerState, {
    ...initialState,
    steps: steps.map((e) => ({executor: e, status: Status.Pending})),
  })

  if (state.current === state.steps.length && state.steps[state.current].status === Status.Committed) {
    exit()
  }

  React.useEffect(() => {
    const t = setTimeout(exit, 5000)
    return () => clearTimeout(t)
  }, [exit])

  if (state.current === -1) {
    return <WelcomeMessage recipeMeta={recipeMeta} />
  }

  return (
    <DispatchContext.Provider value={dispatch}>
      <StepExecutor step={state.steps[state.current].executor} status={state.steps[state.current].status} />
    </DispatchContext.Provider>
  )
}

export class Installer<Options extends InstallerOptions> {
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

  async displayFrontmatter() {
    log.branded(`Welcome to the installer for ${this.options.packageName}`)
    log.branded(this.options.packageDescription)
    log.info(`This package is authored and supported by ${this.options.packageOwner}`)
    log.info(`For additional documentation and support please visit ${this.options.packageRepoLink}`)
    console.log()
    await waitForConfirmation('Press enter to begin installation')
  }

  async run(cliArgs: {}): Promise<void> {
    try {
      await this.validateArgs(cliArgs)
    } catch (err) {
      log.error(err)
      return
    }
    await this.preInstall()
    const {waitUntilExit} = render(<InstallerRenderer steps={this.steps} recipeMeta={this.options} />, {
      experimental: true,
    })
    await waitUntilExit()
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
