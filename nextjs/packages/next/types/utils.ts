export type AsyncFunc = (...args: any) => Promise<any>

/**
 * Infer the type of the parameter from function that takes a single argument
 */
export type FirstParam<
  F extends (...args: any) => Promise<any>
> = Parameters<F>[0]

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
export type PromiseReturnType<T extends (...args: any) => Promise<any>> = Await<
  ReturnType<T>
>

export interface CancellablePromise<T> extends Promise<T> {
  cancel?: Function
}
