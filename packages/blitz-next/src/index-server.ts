import {GetServerSideProps, NextApiRequest, NextApiResponse} from "next"
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

export type Middleware = (
  req: MiddlewareRequest,
  res: MiddlewareResponse,
  next: (error?: Error) => Promise<void> | void,
) => Promise<void> | void

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

const buildMiddleware = (plugins: BlitzPlugin[]): BlitzMiddleware => {
  return (handler: NextApiHandler) => async (req, res) => {
    const middlewares = plugins.flatMap((p) => p.middlewares)

    try {
      await runMiddlewares(middlewares, req, res)
      return handler(req, res)
    } catch (error) {
      return res.status(400).send(error)
    }
  }
}

type GSSPHandler = (
  req: TemporaryAny,
  res: TemporaryAny,
  ctx: TemporaryAny,
) => Promise<TemporaryAny>

type SetupBlitzOptions = {
  plugins: BlitzPlugin[]
}
export const setupBlitz = ({plugins}: SetupBlitzOptions) => {
  const middleware = buildMiddleware(plugins)

  const gSSP =
    (handler: GSSPHandler): GetServerSideProps =>
    async ({req, res}) => {
      await runMiddlewares(
        plugins.flatMap((p) => p.middlewares),
        req as TemporaryAny,
        res as TemporaryAny,
      )
      return handler(req, res, (res as TemporaryAny).blitzCtx)
    }

  const gSP =
    (handler: GSSPHandler): GetServerSideProps =>
    async ({req, res}) => {
      await runMiddlewares(
        plugins.flatMap((p) => p.middlewares),
        req as TemporaryAny,
        res as TemporaryAny,
      )
      return handler(req, res, (res as TemporaryAny).blitzCtx)
    }

  return {withBlitz: middleware, gSSP, gSP, api: middleware}
}
