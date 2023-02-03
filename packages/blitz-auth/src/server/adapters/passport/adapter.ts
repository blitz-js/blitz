/* @eslint-disable no-redeclare */
import cookieSession from "cookie-session"
import passport from "passport"
import {isLocalhost} from "../../index"
import {
  assert,
  connectMiddleware,
  Ctx,
  handleRequestWithMiddleware,
  RequestMiddleware,
  MiddlewareResponse,
  secureProxyMiddleware,
  truncateString,
} from "blitz"
import {SessionContext} from "../../../shared"
import {
  BlitzPassportConfig,
  ApiHandler,
  BlitzPassportConfigObject,
  ApiHandlerIncomingMessage,
  VerifyCallbackResult,
} from "./types"

const isFunction = (functionToCheck: unknown): functionToCheck is Function =>
  typeof functionToCheck === "function"

const isVerifyCallbackResult = (value: unknown): value is VerifyCallbackResult =>
  typeof value === "object" && value !== null && "publicData" in value

const INTERNAL_REDIRECT_URL_KEY = "_redirectUrl"

export function passportAuth(config: BlitzPassportConfig): ApiHandler {
  return async function authHandler(req, res) {
    const configObject: BlitzPassportConfigObject = isFunction(config)
      ? config({ctx: res.blitzCtx, req, res})
      : config

    const cookieSessionMiddleware = cookieSession({
      secret: process.env.SESSION_SECRET_KEY || "default-dev-secret",
      secure: process.env.NODE_ENV === "production" && !isLocalhost(req),
    })

    const passportMiddleware = passport.initialize()

    const middleware: RequestMiddleware<ApiHandlerIncomingMessage, MiddlewareResponse<Ctx>>[] = [
      connectMiddleware(cookieSessionMiddleware as RequestMiddleware),
      connectMiddleware(passportMiddleware as RequestMiddleware),
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

    // Find the requested strategy based on the manually specified name.
    // Use default strategy name if a custom name is not specified.
    const blitzStrategy = configObject.strategies.find(({name, strategy}) =>
      name ? name == req.query?.auth?.[0] : strategy.name === req.query?.auth?.[0] ?? "",
    )
    assert(blitzStrategy, `A passport strategy was not found for: ${req.query.auth[0]}`)

    const {name, strategy, authenticateOptions} = blitzStrategy

    assert(
      typeof strategy.name !== "undefined",
      `A passport strategy name was not found for: ${req.query.auth[0]}`,
    )

    const strategyName = name || strategy.name
    passport.use(strategyName, strategy)

    if (req.query.auth.length === 1) {
      console.info(`Starting authentication via ${strategyName}...`)
      if (req.query.redirectUrl) {
        // eslint-disable-next-line no-shadow
        middleware.push(async (req, res, next) => {
          const session = res.blitzCtx.session as SessionContext
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
          const session = res.blitzCtx.session as SessionContext
          assert(session, "Missing Blitz sessionMiddleware!")

          passport.authenticate(strategyName, async (err: any, result: any) => {
            try {
              let error = err

              if (!error && result === false) {
                console.warn(
                  `Login via ${strategyName} failed - usually this means the user did not authenticate properly with the provider`,
                )
                error = `Login failed`
              }

              const redirectUrlFromVerifyResult =
                result && typeof result === "object" && result.redirectUrl
              let redirectUrl: string =
                redirectUrlFromVerifyResult ||
                (session.$publicData as any)[INTERNAL_REDIRECT_URL_KEY] ||
                (error ? configObject.errorRedirectUrl : configObject.successRedirectUrl) ||
                "/"

              if (error) {
                console.error(`Login via ${strategyName} was unsuccessful.`)
                console.error(error)

                const authErrorQueryStringKey = redirectUrl.includes("?")
                  ? "&authError="
                  : "?authError="
                redirectUrl +=
                  authErrorQueryStringKey +
                  encodeURIComponent(truncateString(error.toString(), 100))
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

    await handleRequestWithMiddleware<ApiHandlerIncomingMessage, MiddlewareResponse<Ctx>>(
      req,
      res,
      middleware,
    )
  }
}
