import {IncomingMessage, OutgoingMessage} from 'http'

type QueryFn = (...args: any) => Promise<any>

type SsrQueryContext = {
  req: IncomingMessage
  res: OutgoingMessage
}

/**
 * Infer the type of the parameter from function that takes a single argument
 */
type InferUnaryParam<F extends Function> = F extends (args: infer A) => any ? A : never

export async function ssrQuery<T extends QueryFn>(
  queryFn: T,
  params: InferUnaryParam<T>,
  // @ts-ignore unused
  context: SsrQueryContext,
): Promise<ReturnType<T>> {
  const data = await queryFn(params)

  return data
}
