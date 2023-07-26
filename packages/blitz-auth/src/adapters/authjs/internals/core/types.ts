import type {AuthConfig} from "@auth/core"
import {EventCallbacks, PagesOptions, CookiesOptions, CallbacksOptions} from "@auth/core/types"
import type {Adapter} from "@auth/core/adapters"
import type {JWTOptions} from "@auth/core/jwt"
import type {
  OAuthConfig,
  ProviderType,
  TokenEndpointHandler,
  UserinfoEndpointHandler,
  AuthorizationEndpointHandler,
  EmailConfig,
  CredentialsConfig,
} from "@auth/core/providers"

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

export interface RequestInternal {
  url: URL
  method: "GET" | "POST"
  cookies?: Partial<Record<string, string>>
  headers?: Record<string, any>
  query?: Record<string, any>
  body?: Record<string, any>
  action: AuthAction
  providerId?: string
  error?: string
}

export interface InternalOptions<TProviderType = ProviderType> {
  providers: InternalProvider[]
  url: URL
  action: AuthAction
  provider: InternalProvider<TProviderType>
  csrfToken?: string
  csrfTokenVerified?: boolean
  secret: string
  theme: Theme
  debug: boolean
  logger: LoggerInstance
  session: NonNullable<Required<AuthConfig["session"]>>
  pages: Partial<PagesOptions>
  jwt: JWTOptions
  events: Partial<EventCallbacks>
  adapter: Required<Adapter> | undefined
  callbacks: CallbacksOptions
  cookies: CookiesOptions
  callbackUrl: string
  /**
   * If true, the OAuth callback is being proxied by the server to the original URL.
   * See also {@link OAuthConfigInternal.redirectProxyUrl}.
   */
  isOnRedirectProxy: boolean
}
