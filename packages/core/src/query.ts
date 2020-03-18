import {NextPage} from 'next'
import {createServerHandler} from './handler'
import {EntityId} from '../types/identity'
import {ActionInput} from '../types/action'

export type QueryInput<I> = ActionInput & {
  id: EntityId
  data: I
}

export type QueryOutput<O> = {
  ok: boolean
  result: O
  errors: any[]
}

type CreateQueryInput<I, O> = {
  handler: (input: QueryInput<I>) => Promise<O>
}

export function createQuery<I, O>({handler}: CreateQueryInput<I, O>) {
  // serverHandler is used to properly execute a handler server side (will be used by RPC)
  const serverHandler = createServerHandler<I, QueryInput<I>, O>(handler)

  async function remote(input: I): Promise<O> {
    //TODO: replace with proper RPC call
    const res = await fetch('/TODO', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    const json = await res.json()

    return json
  }

  return {
    page(nextPage: NextPage<O>) {
      nextPage.getInitialProps = async function(context) {
        // We should do this id parsing stuff somewhere else, I'm just not sure where yet
        const stringId =
          context.query && (Array.isArray(context.query.id) ? context.query.id[0] : context.query.id)
        const id = stringId ? (isNaN(Number(stringId)) ? stringId : parseInt(stringId)) : null

        const inputData = ({id} as unknown) as I

        if (context.req) {
          // On server
          return await serverHandler(inputData, context.req)
        } else {
          // On client
          return await remote(inputData)
        }
      }

      return nextPage
    },
    local: handler,
    remote,
    serverHandler,
  }
}
