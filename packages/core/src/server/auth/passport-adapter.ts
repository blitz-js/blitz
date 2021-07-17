/* eslint-disable es5/no-for-of  -- file only used on the server */
/* eslint-disable es5/no-es6-methods  -- file only used on the server */
import {log} from "@blitzjs/display"
import cookieSession from "cookie-session"
import passport from "passport"
import {
  BlitzPassportConfig,
  BlitzPassportConfigObject,
  SessionContext,
  VerifyCallbackResult,
} from "../../auth/auth-types"
import {BlitzApiHandler, ConnectMiddleware, Ctx, Middleware} from "../../types"
import {
  connectMiddleware,
  getAllMiddlewareForModule,
  handleRequestWithMiddleware,
} from "../middleware"
import {isLocalhost} from "../server-utils"
import {secureProxyMiddleware} from "./secure-proxy-middleware"

function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const isFunction = (functionToCheck: any): functionToCheck is Function =>
  typeof functionToCheck === "function"

const isVerifyCallbackResult = (value: unknown): value is VerifyCallbackResult =>
  typeof value === "object" && value !== null && "publicData" in value

const INTERNAL_REDIRECT_URL_KEY = "_redirectUrl"

export function passportAuth(config: BlitzPassportConfig): BlitzApiHandler {
  return async function authHandler(req, res) {
    const globalMiddleware = getAllMiddlewareForModule({} as any)
    await handleRequestWithMiddleware(req, res, globalMiddleware)

    const configObject: BlitzPassportConfigObject = isFunction(config)
      ? config({ctx: (res as any).blitzCtx as Ctx, req, res})
      : config

    const cookieSessionMiddleware = cookieSession({
      secret: process.env.SESSION_SECRET_KEY || "default-dev-secret",
      secure: process.env.NODE_ENV === "production" && !isLocalhost(req),
    })

    const passportMiddleware = passport.initialize()

    const middleware: Middleware[] = [
      connectMiddleware(cookieSessionMiddleware as ConnectMiddleware),
      connectMiddleware(passportMiddleware as ConnectMiddleware),
      connectMiddleware(passport.session()),
    ]

    if (configObject.secureProxy) {
      middleware.push(secureProxyMiddleware)
    }

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
      log.info(`Starting authentication via ${strategyName}...`)
      if (req.query.redirectUrl) {
        middleware.push(async (req, res, next) => {
          const session = (res as any).blitzCtx.session as SessionContext
          assert(session, "Missing Blitz sessionMiddleware!")
          await session.$setPublicData({[INTERNAL_REDIRECT_URL_KEY]: req.query.redirectUrl} as any)
          return next()
        })
      }
      middleware.push(
        connectMiddleware(passport.authenticate(strategyName, {...authenticateOptions})),
      )
    } else if (req.query.auth[1] === "callback") {
      log.info(`Processing callback for ${strategyName}...`)
      middleware.push(
        connectMiddleware((req, res, next) => {
          const session = (res as any).blitzCtx.session as SessionContext
          assert(session, "Missing Blitz sessionMiddleware!")

          passport.authenticate(strategyName, async (err: any, result: unknown) => {
            try {
              let error = err

              if (!error && result === false) {
                log.warning(
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
