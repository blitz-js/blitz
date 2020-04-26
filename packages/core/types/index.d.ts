// declare module '@prisma/client' {
//   export class PrismaClient {
//     constructor(args: any)
//   }
// }

/**
 * Get the type of the value, that the Promise holds.
 */
export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T

/**
 * Get the return type of a function which returns a Promise.
 */
export type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>

/**
 * Infer the type of the parameter from function that takes a single argument
 */
export type InferUnaryParam<F extends Function> = F extends (args: infer A) => any ? A : never
