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

export interface NextAuth_OAuthConfigInternal<P>
  extends Omit<OAuthConfig<P>, "authorization" | "token" | "userinfo"> {
  authorization?: AuthorizationEndpointHandler
  token?: TokenEndpointHandler
  userinfo?: UserinfoEndpointHandler
}

export type NextAuth_InternalProvider<T = ProviderType> = (T extends "oauth"
  ? NextAuth_OAuthConfigInternal<any>
  : T extends "email"
  ? EmailConfig
  : T extends "credentials"
  ? CredentialsConfig
  : never) & {
  signinUrl: string
  callbackUrl: string
}

export type NextAuth_AuthAction =
  | "providers"
  | "session"
  | "csrf"
  | "signin"
  | "signout"
  | "callback"
  | "verify-request"
  | "error"
  | "_log"

export interface NextAuth_Theme {
  colorScheme?: "auto" | "dark" | "light"
  logo?: string
  brandColor?: string
  buttonText?: string
}

export interface NextAuth_LoggerInstance extends Record<string, Function> {
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

export interface NextAuth_InternalOptions<
  TProviderType = ProviderType,
  WithVerificationToken = TProviderType extends "email" ? true : false,
> {
  providers: NextAuth_InternalProvider[]
  url: URL
  action: NextAuth_AuthAction
  provider: NextAuth_InternalProvider<TProviderType>
  csrfToken?: string
  csrfTokenVerified?: boolean
  secret: string
  theme: NextAuth_Theme
  debug: boolean
  logger: NextAuth_LoggerInstance
  session: Required<NextAuth_LoggerInstance>
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
