import {GetServerSideProps, GetStaticProps, NextApiRequest, NextApiResponse} from "next"
import {MiddlewareRequest} from "./index-browser"

export * from "./index-browser"

type TemporaryAny = any

export interface DefaultCtx {}
export interface Ctx extends DefaultCtx {}

export interface MiddlewareResponse<C = Ctx> extends NextApiResponse {
  blitzCtx: C
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
  req: MiddlewareRequest,
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

type SetupBlitzOptions = {
  plugins: BlitzPlugin[]
}

export type BlitzGSSPHandler = ({
  ctx,
  req,
  res,
  ...args
}: Parameters<GetServerSideProps>[0] & {ctx: Ctx}) => ReturnType<GetServerSideProps>

export type BlitzGSPHandler = ({
  ctx,
  ...args
}: Parameters<GetStaticProps>[0] & {ctx: Ctx}) => ReturnType<GetServerSideProps>

export type BliztAPIHandler = ({
  req,
  res,
  ctx,
}: {
  ctx: Ctx
  req: Parameters<NextApiHandler>[0]
  res: Parameters<NextApiHandler>[1]
}) => ReturnType<NextApiHandler>

export const setupBlitz = ({plugins}: SetupBlitzOptions) => {
  const middlewares = plugins.flatMap((p) => p.middlewares)

  const gSSP =
    (handler: BlitzGSSPHandler): GetServerSideProps =>
    async ({req, res, ...rest}) => {
      await runMiddlewares(middlewares, req as MiddlewareRequest, res as MiddlewareResponse)
      return handler({req, res, ctx: (res as TemporaryAny).blitzCtx, ...rest})
    }

  // todo
  const gSP =
    (handler: BlitzGSPHandler): GetStaticProps =>
    async (context) => {
      await runMiddlewares(middlewares, {} as TemporaryAny, {} as TemporaryAny)
      return handler({...context, ctx: ({} as TemporaryAny)?.blitzCtx})
    }

  const api =
    (handler: BliztAPIHandler): NextApiHandler =>
    async (req, res) => {
      try {
        await runMiddlewares(middlewares, req, res)
        return handler({req, res, ctx: (res as TemporaryAny).blitzCtx})
      } catch (error) {
        return res.status(400).send(error)
      }
    }

  return {gSSP, gSP, api}
}
