import {UrlObject} from "url"
// Context for plugins to declaration merge stuff into
export interface Ctx {}

export interface RouteUrlObject extends Pick<UrlObject, "pathname" | "query"> {
  pathname: string
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
