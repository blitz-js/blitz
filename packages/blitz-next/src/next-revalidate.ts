// copied from https://github.com/blitz-js/blitz/blob/a8046e604ace8bf544c544972328232820cd3d26/packages/blitz-auth/src/server/auth-sessions.ts#L127

import {IncomingMessage, ServerResponse} from "http"
import {UrlObject} from "url"

import {Ctx, RequestMiddleware} from "blitz"
import {NextApiResponse} from "next"
import {NextRouter, resolveHref} from "next/dist/shared/lib/router/router"

export function ensureMiddlewareResponse(
  res: ServerResponse & {[key: string]: any},
): asserts res is ServerResponse & {blitzCtx: Ctx} {
  if (!("blitzCtx" in res)) {
    res.blitzCtx = {} as Ctx
  }
}

export function ensureResponseHasRevalidate(
  res: ServerResponse & {[key: string]: any},
): res is ServerResponse & {revalidate: NextApiResponse["revalidate"]} {
  return !("revalidate" in res)
}

export const revalidateMiddleware: RequestMiddleware<
  IncomingMessage,
  ServerResponse,
  void | Promise<void>
> = (req, res, next) => {
  ensureMiddlewareResponse(res)
  if (!ensureResponseHasRevalidate(res)) {
    return next()
  }

  if (!("revalidatePage" in res.blitzCtx)) {
    res.blitzCtx.revalidatePage = (
      url: UrlObject | string,
      opts?: Parameters<NextApiResponse["revalidate"]>[1],
    ) => res.revalidate(resolveHref({} as NextRouter, url, false), opts)
  }

  return next()
}
