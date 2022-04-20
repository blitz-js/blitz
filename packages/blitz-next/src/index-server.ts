import {GetServerSideProps, GetStaticProps, NextApiRequest, NextApiResponse} from "next"
import type {Ctx as BlitzCtx, BlitzServerPlugin, Middleware, MiddlewareResponse} from "blitz"
import {handleRequestWithMiddleware} from "blitz"

export * from "./index-browser"

// Workaround for TS2742 "Inferred type cannot be named without a reference"
export interface Ctx extends BlitzCtx {}

export interface BlitzNextApiResponse
  extends NextApiResponse,
    Omit<MiddlewareResponse, keyof NextApiResponse> {}

export type NextApiHandler = (
  req: NextApiRequest,
  res: BlitzNextApiResponse,
) => void | Promise<void>

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

export const setupBlitzServer = ({plugins}: SetupBlitzOptions) => {
  const middlewares = plugins.flatMap((p) => p.middlewares)
  const contextMiddleware = plugins.flatMap((p) => p.contextMiddleware).filter(Boolean)

  const gSSP =
    <TProps>(handler: BlitzGSSPHandler<TProps>): GetServerSideProps<TProps> =>
    async ({req, res, ...rest}) => {
      await handleRequestWithMiddleware(req, res, middlewares)
      const ctx = contextMiddleware.reduceRight(
        (y, f) => (f ? f(y) : y),
        (res as MiddlewareResponse).blitzCtx,
      )
      return handler({req, res, ctx, ...rest})
    }

  const gSP =
    (handler: BlitzGSPHandler): GetStaticProps =>
    async (context) => {
      const ctx = contextMiddleware.reduceRight((y, f) => (f ? f(y) : y), {} as Ctx)
      return handler({...context, ctx: ctx})
    }

  const api =
    (handler: BlitzAPIHandler): NextApiHandler =>
    async (req, res) => {
      try {
        await handleRequestWithMiddleware(req, res, middlewares)
        return handler(req, res, res.blitzCtx)
      } catch (error) {
        return res.status(400).send(error)
      }
    }

  return {gSSP, gSP, api}
}

import type {NextConfig} from "next"
import {installWebpackConfig} from "@blitzjs/rpc"

export function withBlitz(nextConfig: NextConfig = {}) {
  return Object.assign({}, nextConfig, {
    webpack: (config: any, options: any) => {
      installWebpackConfig(config)
      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options)
      }
      return config
    },
  } as NextConfig)
}
