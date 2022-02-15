import {GetServerSideProps, GetStaticProps, NextApiRequest, NextApiResponse} from "next"
import {MiddlewareRequest} from "./index-browser"

export * from "./index-browser"

type TemporaryAny = any

export interface DefaultCtx {}
export interface Ctx extends DefaultCtx {}

export interface MiddlewareResponse<C = Ctx> extends NextApiResponse {
  blitzCtx: C
  blitzResult: unknown
}

type NextApiHandler<T = any, C = Ctx> = (
  req: NextApiRequest,
  res: NextApiResponse<T> & {blitzCtx: C},
) => void | Promise<void>

export type BlitzMiddleware = (
  handler: NextApiHandler,
) => (req: MiddlewareRequest, res: MiddlewareResponse, ctx?: TemporaryAny) => Promise<void>

export type MiddlewareNext = (error?: Error) => Promise<void> | void
export type Middleware = {
  (req: MiddlewareRequest, res: MiddlewareResponse, next: MiddlewareNext): Promise<void> | void
  type?: string
  config?: Record<any, any>
}

export type BlitzPlugin = {
  middlewares: Middleware[]
  // particular plugin creators should return unified BlitzPlugin type, so that this file doesn't need to know about particular plugins
}

const runMiddlewares = async (
  middlewares: Middleware[],
  req: NextApiRequest,
  res: MiddlewareResponse,
) => {
  const promises = middlewares.reduce((acc, middleware) => {
    const promise = new Promise(async (resolve, reject) => {
      await middleware(req, res, (result) =>
        result instanceof Error ? reject(result) : resolve(result),
      )
    })
    return [...acc, promise]
  }, [] as Promise<unknown>[])

  await Promise.all(promises)
}

const buildMiddleware = (middlewares: Middleware[]): BlitzMiddleware => {
  return (handler: NextApiHandler) => async (req, res) => {
    try {
      await runMiddlewares(middlewares, req, res)
      return handler(req, res)
    } catch (error) {
      return res.status(400).send(error)
    }
  }
}

type SetupBlitzOptions = {
  plugins: BlitzPlugin[]
}

export type GSSPHandler = ({
  ctx,
  req,
  res,
  ...args
}: Parameters<GetServerSideProps>[0] & {ctx: Ctx}) => ReturnType<GetServerSideProps>
export type GSPHandler = ({
  ctx,
  ...args
}: Parameters<GetStaticProps>[0] & {ctx: Ctx}) => ReturnType<GetServerSideProps>

export const setupBlitz = ({plugins}: SetupBlitzOptions) => {
  const middlewares = plugins.flatMap((p) => p.middlewares)
  const middleware = buildMiddleware(middlewares)

  const gSSP =
    (handler: GSSPHandler): GetServerSideProps =>
    async ({req, res, ...rest}) => {
      await runMiddlewares(middlewares, req as any, res as any)
      return handler({req, res, ctx: (res as TemporaryAny).blitzCtx, ...rest})
    }

  // todo
  const gSP =
    (handler: GSPHandler): GetStaticProps =>
    async (context) => {
      await runMiddlewares(middlewares, {} as TemporaryAny, {} as TemporaryAny)
      return handler({...context, ctx: ({} as TemporaryAny)?.blitzCtx})
    }

  return {gSSP, gSP, api: middleware}
}
