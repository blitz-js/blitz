import {IncomingMessage, OutgoingMessage} from 'http'

type QueryFn = (...args: any) => Promise<any>

type SsrQueryContext = {
  req: IncomingMessage
  res: OutgoingMessage
}

export async function ssrQuery<T extends QueryFn>(
  queryFn: T,
  params: any,
  // @ts-ignore unused
  context: SsrQueryContext,
): Promise<ReturnType<T>> {
  const data = await queryFn(params)

  return data
}
