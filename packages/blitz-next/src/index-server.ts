import {GetServerSideProps, GetStaticProps, NextApiRequest, NextApiResponse} from "next"
import {MiddlewareRequest} from "./index-browser"

export * from "./index-browser"

import type {Ctx as BlitzCtx, BlitzServerPlugin} from "blitz"

// Workaround for TS2742 "Inferred type cannot be named without a reference"
export interface Ctx extends BlitzCtx {}

type TemporaryAny = any

export interface MiddlewareResponse<C = Ctx> extends NextApiResponse {
  blitzCtx: C
}

export type NextApiHandler<T = any, C = Ctx> = (
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
  plugins: BlitzServerPlugin<Middleware, Ctx>[]
}

export type BlitzGSSPHandler<TProps> = ({
  ctx,
  req,
  res,
  ...args
}: Parameters<GetServerSideProps<TProps>>[0] & {ctx: Ctx}) => ReturnType<GetServerSideProps<TProps>>

export type BlitzGSPHandler = ({
  ctx,
  ...args
}: Parameters<GetStaticProps>[0] & {ctx: Ctx}) => ReturnType<GetServerSideProps>

export type BlitzAPIHandler = (
  req: Parameters<NextApiHandler>[0],
  res: Parameters<NextApiHandler>[1],
  ctx: Ctx,
) => ReturnType<NextApiHandler>

export const setupBlitz = ({plugins}: SetupBlitzOptions) => {
  const middlewares = plugins.flatMap((p) => p.middlewares)
  const contextMiddleware = plugins.flatMap((p) => p.contextMiddleware).filter(Boolean)

  const gSSP =
    <TProps>(handler: BlitzGSSPHandler<TProps>): GetServerSideProps<TProps> =>
    async ({req, res, ...rest}) => {
      await runMiddlewares(middlewares, req as MiddlewareRequest, res as MiddlewareResponse)
      const ctx = contextMiddleware.reduceRight(
        (y, f) => (f ? f(y) : y),
        (res as TemporaryAny).blitzCtx as Ctx,
      )
      return handler({req, res, ctx, ...rest})
    }

  const gSP =
    (handler: BlitzGSPHandler): GetStaticProps =>
    async (context) => {
      await runMiddlewares(middlewares, {} as TemporaryAny, {} as TemporaryAny)
      const ctx = contextMiddleware.reduceRight((y, f) => (f ? f(y) : y), {} as Ctx)
      return handler({...context, ctx: ctx})
    }

  const api =
    (handler: BlitzAPIHandler): NextApiHandler =>
    async (req, res) => {
      try {
        await runMiddlewares(middlewares, req, res)
        return handler(req, res, (res as TemporaryAny).blitzCtx)
      } catch (error) {
        return res.status(400).send(error)
      }
    }

  return {gSSP, gSP, api}
}
