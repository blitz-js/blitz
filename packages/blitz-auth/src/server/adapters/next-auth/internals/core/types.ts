import type {CallbacksOptions, CookiesOptions, EventCallbacks} from "next-auth"
import type {Adapter} from "next-auth/adapters"
import type {JWTOptions} from "next-auth/jwt"
import type {
  OAuthConfig,
  ProviderType,
  TokenEndpointHandler,
  UserinfoEndpointHandler,
  AuthorizationEndpointHandler,
  EmailConfig,
  CredentialsConfig,
} from "next-auth/providers"

export interface OAuthConfigInternal<P>
  extends Omit<OAuthConfig<P>, "authorization" | "token" | "userinfo"> {
  authorization?: AuthorizationEndpointHandler
  token?: TokenEndpointHandler
  userinfo?: UserinfoEndpointHandler
}

export type InternalProvider<T = ProviderType> = (T extends "oauth"
  ? OAuthConfigInternal<any>
  : T extends "email"
  ? EmailConfig
  : T extends "credentials"
  ? CredentialsConfig
  : never) & {
  signinUrl: string
  callbackUrl: string
}

export type AuthAction =
  | "providers"
  | "session"
  | "csrf"
  | "login"
  | "signout"
  | "callback"
  | "verify-request"
  | "error"
  | "_log"

export interface Theme {
  colorScheme?: "auto" | "dark" | "light"
  logo?: string
  brandColor?: string
  buttonText?: string
}

export interface LoggerInstance extends Record<string, Function> {
  warn: (code: any) => void
  error: (
    code: string,
    /**
     * Either an instance of (JSON serializable) Error
     * or an object that contains some debug information.
     * (Error is still available through `metadata.error`)
     */
    metadata: Error | {error: Error; [key: string]: unknown},
  ) => void
  debug: (code: string, metadata: unknown) => void
}

export interface InternalOptions<
  TProviderType = ProviderType,
  WithVerificationToken = TProviderType extends "email" ? true : false,
> {
  providers: InternalProvider[]
  url: URL
  action: AuthAction
  provider: InternalProvider<TProviderType>
  secret: string
  theme: Theme
  debug: boolean
  logger: LoggerInstance
  session: Required<LoggerInstance>
  pages: any
  jwt: JWTOptions
  events: Partial<EventCallbacks>
  adapter: WithVerificationToken extends true
    ? Adapter<WithVerificationToken>
    : Adapter<WithVerificationToken> | undefined
  callbacks: CallbacksOptions
  cookies: CookiesOptions
  callbackUrl: string
}
