import {UrlObject} from "url"
// Context for plugins to declaration merge stuff into
export interface Ctx {}

export interface MiddlewareCtx {}

export interface RouteUrlObject extends Pick<UrlObject, "pathname" | "query"> {
  pathname: string
}

export type ResolverConfig = {
  httpMethod: "GET" | "POST"
}

export type BlitzCliConfig = {
  customTemplates?: string
}

export const isRouteUrlObject = (x: any): x is RouteUrlObject => {
  return typeof x === "object" && "pathname" in x && typeof x.pathname === "string"
}

export type AsyncFunc = (...args: any) => Promise<any>

/**
 * Infer the type of the parameter from function that takes a single argument
 */
export type FirstParam<F extends (...args: any) => Promise<any>> = Parameters<F>[0]

/**
 * If type has a Promise, unwrap it. Otherwise return the original type
 */
export type Await<T> = T extends PromiseLike<infer U> ? U : T

/**
 * Ensure the type is a promise
 */
export type EnsurePromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>

/**
 * Get the return type of a function which returns a Promise.
 */
export type PromiseReturnType<T extends (...args: any) => Promise<any>> = Await<ReturnType<T>>

export interface CancellablePromise<T> extends Promise<T> {
  cancel?: Function
}

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never

export type Simplify<T> = {[P in keyof T]: T[P]}

export type AddParameters<
  TFunction extends (...args: any) => any,
  TParameters extends [...args: any],
> = (...args: [...Parameters<TFunction>, ...TParameters]) => ReturnType<TFunction>

/* Shared Types Between RPC and Auth */
export interface Session {
  // isAuthorize can be injected here
  // PublicData can be injected here
}

export type PublicData = Session extends {PublicData: unknown}
  ? Session["PublicData"]
  : {userId: unknown}

export interface EmptyPublicData extends Partial<Omit<PublicData, "userId">> {
  userId: PublicData["userId"] | null
}

export type IsAuthorizedArgs = Session extends {
  isAuthorized: (...args: any) => any
}
  ? "args" extends keyof Parameters<Session["isAuthorized"]>[0]
    ? Parameters<Session["isAuthorized"]>[0]["args"]
    : unknown[]
  : unknown[]

export interface SessionContextBase {
  $handle: string | null
  $publicData: unknown
  $authorize(...args: IsAuthorizedArgs): asserts this is AuthenticatedSessionContext
  // $isAuthorized cannot have assertion return type because it breaks advanced use cases
  // with multiple isAuthorized calls
  $isAuthorized: (...args: IsAuthorizedArgs) => boolean
  $thisIsAuthorized: (...args: IsAuthorizedArgs) => this is AuthenticatedSessionContext
  $create: (publicData: PublicData, privateData?: Record<any, any>) => Promise<void>
  $revoke: () => Promise<void>
  $revokeAll: () => Promise<void>
  $getPrivateData: () => Promise<Record<any, any>>
  $setPrivateData: (data: Record<any, any>) => Promise<void>
  $setPublicData: (data: Partial<Omit<PublicData, "userId">>) => Promise<void>
}

export interface SessionContext extends SessionContextBase, EmptyPublicData {
  $publicData: Partial<PublicData> | EmptyPublicData
}

export interface AuthenticatedSessionContext extends SessionContextBase, PublicData {
  userId: PublicData["userId"]
  $publicData: PublicData
}
export interface ClientSession extends EmptyPublicData {
  isLoading: boolean
}
