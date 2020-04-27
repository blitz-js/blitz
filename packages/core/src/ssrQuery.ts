import {IncomingMessage, OutgoingMessage} from 'http'
import {InferUnaryParam} from './types'

type QueryFn = (...args: any) => Promise<any>

type SsrQueryContext = {
  req: IncomingMessage
  res: OutgoingMessage
}

export async function ssrQuery<T extends QueryFn>(
  queryFn: T,
  params: InferUnaryParam<T>,
  // @ts-ignore unused
  context: SsrQueryContext,
): Promise<ReturnType<T>> {
  const data = await queryFn(params)

  return data
}
