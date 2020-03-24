import {createValidHandler, createServerHandler} from './handler'
import {ActionInput} from '../types/action'
import {ValidationFn} from '../types/validation'

export type MutationInput<I> = ActionInput & {
  data: I
}

type CreateMutationInput<I> = {
  validateInput?: ValidationFn<I>
  handler: (input: MutationInput<I>) => Promise<any>
}

export function createMutation<I>({handler, validateInput = () => ({})}: CreateMutationInput<I>) {
  const validHandler = createValidHandler<MutationInput<I>, O>(handler, validateInput)

  // serverHandler is used to properly execute a handler server side (will be used by RPC)
  const serverHandler = createServerHandler<I, MutationInput<I>, O>(validHandler)

  return {
    handler: validHandler,
    serverHandler,
    validateInput,
    remote: async (input: I): Promise<ReturnType<typeof handler>> => {
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
