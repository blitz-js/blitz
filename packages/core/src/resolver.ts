import {infer as zInfer, ZodSchema} from "zod"
import {Ctx} from "./middleware"
import {SessionContext, SessionContextBase} from "./supertokens"
import {Await} from "./types"

type PipeFn<Prev, Next> = (i: Await<Prev>, c: Ctx) => Next

function pipe<A, Z>(ab: (i: A, c: Ctx) => Z): (input: A, ctx: Ctx) => Z
function pipe<A, B, C>(ab: PipeFn<A, B>, bc: PipeFn<B, C>): (input: A, ctx: Ctx) => C
function pipe<A, B, C, D>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
): (input: A, ctx: Ctx) => D
function pipe<A, B, C, D, E>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
  de: PipeFn<D, E>,
): (input: A, ctx: Ctx) => E
function pipe<A, B, C, D, E, F>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
  de: PipeFn<D, E>,
  ef: PipeFn<E, F>,
): (input: A, ctx: Ctx) => F
function pipe<A, B, C, D, E, F, G>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
  de: PipeFn<D, E>,
  ef: PipeFn<E, F>,
  fg: PipeFn<F, G>,
): (input: A, ctx: Ctx) => G
function pipe<A, B, C, D, E, F, G, H>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
  de: PipeFn<D, E>,
  ef: PipeFn<E, F>,
  fg: PipeFn<F, G>,
  gh: PipeFn<G, H>,
): (input: A, ctx: Ctx) => H
function pipe<A, B, C, D, E, F, G, H, I>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
  de: PipeFn<D, E>,
  ef: PipeFn<E, F>,
  fg: PipeFn<F, G>,
  gh: PipeFn<G, H>,
  hi: PipeFn<H, I>,
): (input: A, ctx: Ctx) => I
function pipe<A, B, C, D, E, F, G, H, I, J>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
  de: PipeFn<D, E>,
  ef: PipeFn<E, F>,
  fg: PipeFn<F, G>,
  gh: PipeFn<G, H>,
  hi: PipeFn<H, I>,
  ij: PipeFn<I, J>,
): (input: A, ctx: Ctx) => J
function pipe<A, B, C, D, E, F, G, H, I, J, K>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
  de: PipeFn<D, E>,
  ef: PipeFn<E, F>,
  fg: PipeFn<F, G>,
  gh: PipeFn<G, H>,
  hi: PipeFn<H, I>,
  ij: PipeFn<I, J>,
  jk: PipeFn<J, K>,
): (input: A, ctx: Ctx) => K
function pipe<A, B, C, D, E, F, G, H, I, J, K, L>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
  de: PipeFn<D, E>,
  ef: PipeFn<E, F>,
  fg: PipeFn<F, G>,
  gh: PipeFn<G, H>,
  hi: PipeFn<H, I>,
  ij: PipeFn<I, J>,
  jk: PipeFn<J, K>,
  kl: PipeFn<K, L>,
): (input: A, ctx: Ctx) => L
function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
  de: PipeFn<D, E>,
  ef: PipeFn<E, F>,
  fg: PipeFn<F, G>,
  gh: PipeFn<G, H>,
  hi: PipeFn<H, I>,
  ij: PipeFn<I, J>,
  jk: PipeFn<J, K>,
  kl: PipeFn<K, L>,
  lm: PipeFn<L, M>,
): (input: A, ctx: Ctx) => M
function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
  de: PipeFn<D, E>,
  ef: PipeFn<E, F>,
  fg: PipeFn<F, G>,
  gh: PipeFn<G, H>,
  hi: PipeFn<H, I>,
  ij: PipeFn<I, J>,
  jk: PipeFn<J, K>,
  kl: PipeFn<K, L>,
  lm: PipeFn<L, M>,
  mn: PipeFn<M, N>,
): (input: A, ctx: Ctx) => N
function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
  de: PipeFn<D, E>,
  ef: PipeFn<E, F>,
  fg: PipeFn<F, G>,
  gh: PipeFn<G, H>,
  hi: PipeFn<H, I>,
  ij: PipeFn<I, J>,
  jk: PipeFn<J, K>,
  kl: PipeFn<K, L>,
  lm: PipeFn<L, M>,
  mn: PipeFn<M, N>,
  no: PipeFn<N, O>,
): (input: A, ctx: Ctx) => O
function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
  de: PipeFn<D, E>,
  ef: PipeFn<E, F>,
  fg: PipeFn<F, G>,
  gh: PipeFn<G, H>,
  hi: PipeFn<H, I>,
  ij: PipeFn<I, J>,
  jk: PipeFn<J, K>,
  kl: PipeFn<K, L>,
  lm: PipeFn<L, M>,
  mn: PipeFn<M, N>,
  no: PipeFn<N, O>,
  op: PipeFn<O, P>,
): (input: A, ctx: Ctx) => P
function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(
  ab: PipeFn<A, B>,
  bc: PipeFn<B, C>,
  cd: PipeFn<C, D>,
  de: PipeFn<D, E>,
  ef: PipeFn<E, F>,
  fg: PipeFn<F, G>,
  gh: PipeFn<G, H>,
  hi: PipeFn<H, I>,
  ij: PipeFn<I, J>,
  jk: PipeFn<J, K>,
  kl: PipeFn<K, L>,
  lm: PipeFn<L, M>,
  mn: PipeFn<M, N>,
  no: PipeFn<N, O>,
  op: PipeFn<O, P>,
  pq: PipeFn<P, Q>,
): (input: A, ctx: Ctx) => Q
function pipe(...args: unknown[]): unknown {
  const functions = args as PipeFn<unknown, unknown>[]

  return async function (input: unknown, ctx: Ctx) {
    let lastResult = input
    for (let fn of functions) {
      lastResult = await fn(lastResult, ctx)
    }
    return lastResult
  }
}

export const resolver = {
  pipe,
  zod<Schema extends ZodSchema<any, any>, Type = zInfer<Schema>>(schema: Schema) {
    return (input: Type): Type => schema.parse(input)
  },
  authorize(...args: Parameters<SessionContextBase["$authorize"]>) {
    return function <T>(input: T, ctx: any) {
      const session: SessionContext = ctx.session
      session.$authorize(...args)
      return input
    }
  },
  authorizeIf<T>(
    conditionCallback: (input: T, ctx: Ctx) => boolean,
    ...args: Parameters<SessionContextBase["$authorize"]>
  ) {
    return function (input: T, ctx: any) {
      const session: SessionContext = ctx.session
      if (conditionCallback(input, ctx)) {
        session.$authorize(...args)
      }
      return input
    }
  },
}
