import {BlitzApiRequest, BlitzApiResponse} from "."
import {
  getAllMiddlewareForModule,
  handleRequestWithMiddleware,
  connectMiddleware,
  Middleware,
} from "./middleware"
import {SessionContext, PublicData} from "./supertokens"
import {log} from "@blitzjs/display"
import passport, {Strategy} from "passport"
import cookieSession from "cookie-session"

export type BlitzPassportConfig = {
  successRedirectUrl?: string
  errorRedirectUrl?: string
  strategies: Required<Strategy>[]
}

export type VerifyCallbackResult = {
  publicData: PublicData
  privateData?: Record<string, any>
  redirectUrl?: string
}

function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export function isLocalhost(req: BlitzApiRequest): boolean {
  let {host} = req.headers
  let localhost = false
  if (host) {
    host = host.split(":")[0]
    localhost = host === "localhost"
  }
  return localhost
}

const isVerifyCallbackResult = (value: unknown): value is VerifyCallbackResult =>
  typeof value === "object" && value !== null && "publicData" in value

const INTERNAL_REDIRECT_URL_KEY = "_redirectUrl"

export function passportAuth(config: BlitzPassportConfig) {
  return async function authHandler(req: BlitzApiRequest, res: BlitzApiResponse) {
    const middleware: Middleware[] = [
      // TODO - fix TS type - shouldn't need `any` here
      connectMiddleware(
        cookieSession({
          secret: process.env.SESSION_SECRET_KEY || "default-dev-secret",
          secure: process.env.NODE_ENV === "production" && !isLocalhost(req),
        }) as any,
      ),
      // TODO - fix TS type - shouldn't need `any` here
      connectMiddleware(passport.initialize() as any),
      connectMiddleware(passport.session()),
    ]

    if (!req.query.auth.length) {
      return res.status(404).end()
    }

    assert(
      config.strategies.length,
      "No Passport strategies found! Please add at least one strategy.",
    )

    const strategy = config.strategies.find((strategy) => strategy.name === req.query.auth[0])
    assert(strategy, `A passport strategy was not found for: ${req.query.auth[0]}`)

    passport.use(strategy)

    if (req.query.auth.length === 1) {
      log.info(`Starting authentication via ${strategy.name}...`)
      if (req.query.redirectUrl) {
        middleware.push(async (req, res, next) => {
          const session = res.blitzCtx.session as SessionContext
          assert(session, "Missing Blitz sessionMiddleware!")
          await session.setPublicData({[INTERNAL_REDIRECT_URL_KEY]: req.query.redirectUrl})
          return next()
        })
      }
      middleware.push(connectMiddleware(passport.authenticate(strategy.name)))
    } else if (req.query.auth[1] === "callback") {
      log.info(`Processing callback for ${strategy.name}...`)
      middleware.push(
        connectMiddleware((req, res, next) => {
          const session = (res as any).blitzCtx.session as SessionContext
          assert(session, "Missing Blitz sessionMiddleware!")

          passport.authenticate(strategy.name, async (err: any, result: unknown) => {
            try {
              let error = err

              if (!error) {
                if (result === false) {
                  log.warning(
                    `Login via ${strategy.name} failed - usually this means the user did not authenticate properly with the provider`,
                  )
                  error = `Login failed`
                }
                assert(
                  typeof result === "object" && result !== null,
                  `Your '${strategy.name}' passport verify callback returned empty data. Ensure you call 'done(null, {publicData: {userId: 1, roles: ['myRole']}})')`,
                )
                assert(
                  (result as any).publicData,
                  `'publicData' is missing from your '${strategy.name}' passport verify callback. Ensure you call 'done(null, {publicData: {userId: 1, roles: ['myRole']}})')`,
                )
              }

              const redirectUrlFromVerifyResult =
                result && typeof result === "object" && (result as any).redirectUrl
              let redirectUrl =
                redirectUrlFromVerifyResult ||
                session.publicData[INTERNAL_REDIRECT_URL_KEY] ||
                (error ? config.errorRedirectUrl : config.successRedirectUrl) ||
                "/"

              if (error) {
                redirectUrl += "?authError=" + error.toString()
                res.setHeader("Location", redirectUrl)
                res.statusCode = 302
                res.end()
                return
              }

              assert(isVerifyCallbackResult(result), "Passport verify callback is invalid")

              await session.create(
                {...result.publicData, [INTERNAL_REDIRECT_URL_KEY]: undefined},
                result.privateData,
              )

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

    const globalMiddleware = getAllMiddlewareForModule({} as any)
    await handleRequestWithMiddleware(req, res, [...globalMiddleware, ...middleware])
  }
}
