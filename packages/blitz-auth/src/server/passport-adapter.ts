/* @eslint-disable no-redeclare */
import cookieSession from "cookie-session"
import passport from "passport"
import type {AuthenticateOptions, Strategy} from "passport"
import {isLocalhost} from "./index"
import {assert, connectMiddleware, Ctx, handleRequestWithMiddleware, Middleware, MiddlewareNext} from "blitz"
import {IncomingMessage, ServerResponse} from "http"
import {PublicData} from "../shared"
import { NextMiddleware } from "next/server"

const isFunction = (functionToCheck: any): functionToCheck is Function =>
  typeof functionToCheck === "function"

const isVerifyCallbackResult = (value: unknown): value is VerifyCallbackResult =>
  typeof value === "object" && value !== null && "publicData" in value

const INTERNAL_REDIRECT_URL_KEY = "_redirectUrl"

export interface BlitzPassportConfigCallbackParams {
  ctx: Ctx
  req: IncomingMessage
  res: ServerResponse
}

export type BlitzPassportConfigCallback = ({
  ctx,
  req,
  res,
}: BlitzPassportConfigCallbackParams) => BlitzPassportConfigObject

export type BlitzPassportConfig = BlitzPassportConfigObject | BlitzPassportConfigCallback

export type BlitzPassportStrategy = {
  authenticateOptions?: AuthenticateOptions
  strategy: Strategy
}

export type BlitzPassportConfigObject = {
  successRedirectUrl?: string
  errorRedirectUrl?: string
  strategies: BlitzPassportStrategy[]
  secureProxy?: boolean
}

export type VerifyCallbackResult = {
  publicData: PublicData
  privateData?: Record<string, any>
  redirectUrl?: string
}

export type ApiHandler = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>

/**
 * Returns a Blitz middleware function that varies its async logic based on if the
 * given middleware function declares at least 3 parameters, i.e. includes
 * the `next` callback function
 */
 export function connectMiddleware(middleware: Middleware): Middleware {
  const handler =
    middleware.length < 3 ? noCallbackHandler : withCallbackHandler
  return function connectHandler(req: MiddlewareRequest, res, next) {
    return handler(req, res, next, middleware)
  } as Middleware
}

/**
 * If the middleware function doesn't declare receiving the `next` callback
 * assume that it's synchronous and invoke `next` ourselves
 */
 function noCallbackHandler(
  req: IncomingMessage,
  res: ServerResponse,
  next: any,
  middleware: Middleware
) {
  // Cast to any to call with two arguments for connect compatibility
  ;(middleware as any)(req, res)
  return next(req, res)
}
export function passportAuth(config: BlitzPassportConfig): ApiHandler {
  return async function authHandler(req, res) {
    const configObject: BlitzPassportConfigObject = isFunction(config)
      ? config({ctx: (res as any).blitzCtx as Ctx, req, res})
      : config

    const cookieSessionMiddleware = cookieSession({
      secret: process.env.SESSION_SECRET_KEY || "default-dev-secret",
      secure: process.env.NODE_ENV === "production" && !isLocalhost(req),
    })

    const passportMiddleware = passport.initialize()

    const middleware: Middleware<IncomingMessage, ServerResponse>[] = [
      connectMiddleware(cookieSessionMiddleware),
      connectMiddleware(passportMiddleware),
      connectMiddleware(passport.session()),
    ]

    if (configObject.secureProxy) {
      middleware.push(secureProxyMiddleware)
    }

    assert(
      req.query.auth,
      "req.query.auth is not defined. Page must be named [...auth].ts/js. See more at https://blitzjs.com/docs/passportjs#1-add-the-passport-js-api-route",
    )
    assert(
      Array.isArray(req.query.auth),
      "req.query.auth must be an array. Page must be named [...auth].ts/js. See more at https://blitzjs.com/docs/passportjs#1-add-the-passport-js-api-route",
    )

    if (!req.query.auth.length) {
      return res.status(404).end()
    }

    assert(
      configObject.strategies.length,
      "No Passport strategies found! Please add at least one strategy.",
    )

    const blitzStrategy = configObject.strategies.find(
      ({strategy}) => strategy.name === req.query.auth[0],
    )
    assert(blitzStrategy, `A passport strategy was not found for: ${req.query.auth[0]}`)

    const {strategy, authenticateOptions} = blitzStrategy

    passport.use(strategy)
    const strategyName = strategy.name as string

    if (req.query.auth.length === 1) {
      console.info(`Starting authentication via ${strategyName}...`)
      if (req.query.redirectUrl) {
        // eslint-disable-next-line no-shadow
        middleware.push(async (req, res, next) => {
          const session = (res as any).blitzCtx.session as SessionContext
          assert(session, "Missing Blitz sessionMiddleware!")
          await session.$setPublicData({
            [INTERNAL_REDIRECT_URL_KEY]: req.query.redirectUrl,
          } as any)
          return next()
        })
      }
      middleware.push(
        connectMiddleware(passport.authenticate(strategyName, {...authenticateOptions})),
      )
    } else if (req.query.auth[1] === "callback") {
      console.info(`Processing callback for ${strategyName}...`)
      middleware.push(
        // eslint-disable-next-line no-shadow
        connectMiddleware((req, res, next) => {
          const session = (res as any).blitzCtx.session as SessionContext
          assert(session, "Missing Blitz sessionMiddleware!")

          passport.authenticate(strategyName, async (err: any, result: unknown) => {
            try {
              let error = err

              if (!error && result === false) {
                console.warn(
                  `Login via ${strategyName} failed - usually this means the user did not authenticate properly with the provider`,
                )
                error = `Login failed`
              }

              const redirectUrlFromVerifyResult =
                result && typeof result === "object" && (result as any).redirectUrl
              let redirectUrl: string =
                redirectUrlFromVerifyResult ||
                (session.$publicData as any)[INTERNAL_REDIRECT_URL_KEY] ||
                (error ? configObject.errorRedirectUrl : configObject.successRedirectUrl) ||
                "/"

              if (error) {
                redirectUrl += "?authError=" + encodeURIComponent(error.toString())
                res.setHeader("Location", redirectUrl)
                res.statusCode = 302
                res.end()
                return
              }

              assert(
                typeof result === "object" && result !== null,
                `Your '${strategyName}' passport verify callback returned empty data. Ensure you call 'done(null, {publicData: {userId: 1}})' along with any other publicData fields you need)`,
              )
              assert(
                (result as any).publicData,
                `'publicData' is missing from your '${strategyName}' passport verify callback. Ensure you call 'done(null, {publicData: {userId: 1}})' along with any other publicData fields you need)`,
              )
              assert(isVerifyCallbackResult(result), "Passport verify callback is invalid")

              delete (result.publicData as any)[INTERNAL_REDIRECT_URL_KEY]

              await session.$create(result.publicData, result.privateData)

              res.setHeader("Location", redirectUrl)
              res.statusCode = 302
              res.end()
            } catch (error) {
              console.error(error)
              res.statusCode = 500
              res.end()
            }
          })(req, res, next)
        }),
      )
    }

    await handleRequestWithMiddleware(req, res, middleware)
  }
}
