import { Box, Text, useApp, useInput } from 'ink'
import React from 'react'
import { EnterToContinue } from './components/enter-to-continue'
import { Newline } from './components/newline'
import * as AddDependencyExecutor from './executors/add-dependency-executor'
import { Executor, ExecutorConfig, Frontmatter } from './executors/executor'
import * as FileTransformExecutor from './executors/file-transform-executor'
import * as NewFileExecutor from './executors/new-file-executor'
import * as PrintMessageExecutor from './executors/print-message-executor'
import { RecipeCLIArgs, RecipeCLIFlags, RecipeMeta } from './types'
import { useEnterToContinue } from './utils/use-enter-to-continue'
import { useUserInput } from './utils/use-user-input'

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

const ExecutorMap: { [key: string]: Executor } = {
  [AddDependencyExecutor.type]: AddDependencyExecutor,
  [NewFileExecutor.type]: NewFileExecutor,
  [PrintMessageExecutor.type]: PrintMessageExecutor,
  [FileTransformExecutor.type]: FileTransformExecutor,
} as const

interface State {
  steps: {
    executor: ExecutorConfig
    status: Status
    proposalData?: any
    successMsg: string
  }[]
  current: number
}

function recipeReducer(state: State, action: { type: Action; data?: any }) {
  const newState = { ...state }
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
      newState.current = Math.min(
        newState.current + 1,
        newState.steps.length - 1
      )
      break
    case Action.SkipStep:
      newState.current += 1
      break
  }
  return newState
}

interface RecipeProps {
  cliArgs: RecipeCLIArgs
  cliFlags: RecipeCLIFlags
  steps: ExecutorConfig[]
  recipeMeta: RecipeMeta
}

const DispatchContext = React.createContext<
  React.Dispatch<{ type: Action; data?: any }>
>(() => {})

function WelcomeMessage({
  recipeMeta,
  enterToContinue = true,
}: {
  recipeMeta: RecipeMeta
  enterToContinue?: boolean
}) {
  return (
    <Box flexDirection="column">
      <Text color="#8a3df0" bold>
        Recipe: {recipeMeta.name}
      </Text>
      <Newline />
      <Text color="gray">
        <Text italic>{recipeMeta.description}</Text>
      </Text>
      <Newline />
      <Text color="gray">
        Repo: <Text italic>{recipeMeta.repoLink}</Text>
      </Text>
      <Text color="gray">
        Author: <Text italic>{recipeMeta.owner}</Text>
      </Text>
      {enterToContinue && <EnterToContinue />}
    </Box>
  )
}

function StepMessages({ state }: { state: State }) {
  const messages = state.steps
    .map((step) => ({
      msg: step.successMsg,
      icon: step.executor.successIcon ?? '✅',
    }))
    .filter((s) => s.msg)

  return (
    <>
      {messages.map(({ msg, icon }, index) => (
        <Text key={msg + index} color="green">
          {msg === '\n' ? '' : icon} {msg}
        </Text>
      ))}
    </>
  )
}

function StepExecutor({
  cliArgs,
  cliFlags,
  proposalData,
  step,
  status,
}: {
  step: ExecutorConfig
  status: Status
  cliArgs: RecipeCLIArgs
  cliFlags: RecipeCLIFlags
  proposalData?: any
}) {
  const { Propose, Commit }: Executor = ExecutorMap[step.stepType]
  const dispatch = React.useContext(DispatchContext)

  const handleProposalAccepted = React.useCallback(
    (msg) => {
      dispatch({ type: Action.CommitApproved, data: msg })
    },
    [dispatch]
  )
  const handleChangeCommitted = React.useCallback(
    (msg) => {
      dispatch({ type: Action.CompleteChange, data: msg })
    },
    [dispatch]
  )

  React.useEffect(() => {
    if (status === Status.Pending) {
      dispatch({ type: Action.ProposeChange })
    } else if (status === Status.ReadyToCommit) {
      dispatch({ type: Action.ApplyChange })
    }
    if (status === Status.Proposed && !Propose) {
      dispatch({ type: Action.CommitApproved })
    }
  }, [dispatch, status, Propose])

  return (
    <Box flexDirection="column">
      {status !== Status.Committed ? <Frontmatter executor={step} /> : null}
      {[Status.Proposed].includes(status) && Propose ? (
        <Propose
          cliArgs={cliArgs}
          cliFlags={cliFlags}
          step={step}
          onProposalAccepted={handleProposalAccepted}
        />
      ) : null}
      {[Status.Committing].includes(status) ? (
        <Commit
          cliArgs={cliArgs}
          cliFlags={cliFlags}
          proposalData={proposalData}
          step={step}
          onChangeCommitted={handleChangeCommitted}
        />
      ) : null}
    </Box>
  )
}

export function RecipeRenderer({
  cliArgs,
  cliFlags,
  steps,
  recipeMeta,
}: RecipeProps) {
  const userInput = useUserInput(cliFlags)
  const { exit } = useApp()
  const [state, dispatch] = React.useReducer(recipeReducer, {
    current: userInput ? -1 : 0,
    steps: steps.map((e) => ({
      executor: e,
      status: Status.Pending,
      successMsg: '',
    })),
  })

  if (steps.length === 0) {
    exit(new Error('This recipe has no steps'))
  }

  React.useEffect(() => {
    if (
      state.current === state.steps.length - 1 &&
      state.steps[state.current]?.status === Status.Committed
    ) {
      exit()
    }
  })

  return (
    <DispatchContext.Provider value={dispatch}>
      {userInput ? (
        <RecipeRendererWithInput
          cliArgs={cliArgs}
          cliFlags={cliFlags}
          state={state}
          recipeMeta={recipeMeta}
        />
      ) : (
        <RecipeRendererWithoutInput
          cliArgs={cliArgs}
          cliFlags={cliFlags}
          state={state}
          recipeMeta={recipeMeta}
        />
      )}
    </DispatchContext.Provider>
  )
}

function RecipeRendererWithInput({
  cliArgs,
  cliFlags,
  recipeMeta,
  state,
}: Omit<RecipeProps, 'steps'> & { state: State }) {
  const { exit } = useApp()
  const dispatch = React.useContext(DispatchContext)

  useInput((input, key) => {
    if (input === 'c' && key.ctrl) {
      exit(new Error('You aborted installation'))
      return
    }
  })

  useEnterToContinue(
    () => dispatch({ type: Action.SkipStep }),
    state.current === -1
  )

  return (
    <>
      <StepMessages state={state} />
      {state.current === -1 ? (
        <WelcomeMessage recipeMeta={recipeMeta} />
      ) : (
        <StepExecutor
          cliArgs={cliArgs}
          cliFlags={cliFlags}
          proposalData={state.steps[state.current]?.proposalData}
          step={state.steps[state.current]?.executor}
          status={state.steps[state.current]?.status}
        />
      )}
    </>
  )
}

function RecipeRendererWithoutInput({
  cliArgs,
  cliFlags,
  recipeMeta,
  state,
}: Omit<RecipeProps, 'steps'> & { state: State }) {
  return (
    <>
      <WelcomeMessage recipeMeta={recipeMeta} enterToContinue={false} />
      <StepMessages state={state} />
      <StepExecutor
        cliArgs={cliArgs}
        cliFlags={cliFlags}
        proposalData={state.steps[state.current]?.proposalData}
        step={state.steps[state.current]?.executor}
        status={state.steps[state.current]?.status}
      />
    </>
  )
}
