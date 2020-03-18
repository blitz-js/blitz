import {createValidHandler, createServerHandler} from './handler'
import {ActionInput} from '../types/action'
import {ValidationFn} from '../types/validation'

export type MutationInput<I> = ActionInput & {
  data: I
}

export type MutationOutput<O> = {
  ok: boolean
  result: O
  errors: any[]
}

type CreateMutationInput<I, O> = {
  validateInput: ValidationFn<I>
  handler: (input: MutationInput<I>) => Promise<O>
}

export function createMutation<I, O>({handler, validateInput}: CreateMutationInput<I, O>) {
  const validHandler = createValidHandler<MutationInput<I>, O>(handler, validateInput)

  // serverHandler is used to properly execute a handler server side (will be used by RPC)
  const serverHandler = createServerHandler<I, MutationInput<I>, O>(validHandler)

  return {
    local: validHandler,
    serverHandler,
    validateInput,
    remote: async (input: I): Promise<MutationOutput<O>> => {
      //TODO: replace with proper RPC call
      const res = await fetch('/TODO', {
        method: 'POST',
        body: JSON.stringify(input),
      })
      const json = await res.json()
      return json
    },
  }
}
