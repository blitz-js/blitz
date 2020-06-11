import React from 'react'
import {Box, Text, Color, useApp, Static} from 'ink'
import {ExecutorConfig, Executor, Frontmatter} from './executors/executor'
import {RecipeMeta} from './installer'
import {Branded} from './components/branded'
import {Newline} from './components/newline'
import {useEnterToContinue} from './utils/use-enter-to-continue'
import * as AddDependencyExecutor from './executors/add-dependency-executor'
import * as NewFileExecutor from './executors/new-file-executor'
import * as FileTransformExecutor from './executors/file-transform-executor'

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

const ExecutorMap: {[key: string]: Executor} = {
  [AddDependencyExecutor.type]: AddDependencyExecutor,
  [NewFileExecutor.type]: NewFileExecutor,
  [FileTransformExecutor.type]: FileTransformExecutor,
} as const

interface State {
  steps: {executor: ExecutorConfig; status: Status; proposalData?: any; successMsg: string}[]
  current: number
}

const initialState: State = {
  steps: [],
  current: -1,
}

function recipeReducer(state = initialState, action: {type: Action; data?: any}) {
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
      newState.steps[newState.current].successMsg = action.data as string
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
      {status !== Status.Committed && <Frontmatter executor={step} />}
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

export function RecipeRenderer({cliArgs, steps, recipeMeta}: RecipeProps) {
  const {exit} = useApp()
  const [state, dispatch] = React.useReducer(recipeReducer, {
    ...initialState,
    steps: steps.map((e) => ({executor: e, status: Status.Pending, successMsg: ''})),
  })

  useEnterToContinue(() => dispatch({type: Action.SkipStep}), state.current === -1)

  React.useEffect(() => {
    if (state.current === state.steps.length - 1 && state.steps[state.current].status === Status.Committed) {
      exit()
    }
  })

  const messages = state.steps.map((step) => step.successMsg).filter((s) => s)

  return (
    <DispatchContext.Provider value={dispatch}>
      <Static>
        {messages.map((msg, idx) => (
          <Color key={msg + idx + Math.random()} green>
            <Text>
              {msg === '\n' ? '' : '✅'} {msg}
            </Text>
          </Color>
        ))}
      </Static>
      {state.current === -1 && <WelcomeMessage recipeMeta={recipeMeta} />}
      {state.current > -1 && (
        <StepExecutor
          cliArgs={cliArgs}
          proposalData={state.steps[state.current]?.proposalData}
          step={state.steps[state.current]?.executor}
          status={state.steps[state.current]?.status}
        />
      )}
    </DispatchContext.Provider>
  )
}
