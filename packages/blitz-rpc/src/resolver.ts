import {Await, Ctx, EnsurePromise, log, MiddlewareCtx} from "blitz"
import type {input as zInput, output as zOutput, ZodTypeAny} from "zod"

export type ParserType = "sync" | "async"

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

interface ResultWithContext<Result = unknown, Context = unknown> {
  __blitz: true
  value: Result
  ctx: Context
}
function isResultWithContext(x: unknown): x is ResultWithContext {
  return (
    typeof x === "object" && x !== null && "ctx" in x && (x as ResultWithContext).__blitz === true
  )
}

declare module "blitz" {
  interface MiddlewareCtx {}
}

type PipeFn<Prev, Next, PrevCtx, NextCtx = PrevCtx> = (
  i: Await<Prev>,
  c: PrevCtx,
) => Next extends ResultWithContext ? never : Next | ResultWithContext<Next, NextCtx>

function pipe<A, Z>(ab: (i: A, c: Ctx) => Z): (input: A, ctx: Ctx) => EnsurePromise<Z>
function pipe<A, B, C, CA = Ctx, CB = CA, CC = CB>(
  ab: PipeFn<A, B, CA, CB>,
  bc: PipeFn<B, C, CB, CC>,
): (input: A, ctx: CA) => EnsurePromise<C>
function pipe<A, B, C, D, CA = Ctx, CB = CA, CC = CB, CD = CC>(
  ab: PipeFn<A, B, CA, CB>,
  bc: PipeFn<B, C, CB, CC>,
  cd: PipeFn<C, D, CC, CD>,
): (input: A, ctx: CA) => EnsurePromise<D>
function pipe<A, B, C, D, E, CA = Ctx, CB = CA, CC = CB, CD = CC, CE = CD>(
  ab: PipeFn<A, B, CA, CB>,
  bc: PipeFn<B, C, CB, CC>,
  cd: PipeFn<C, D, CC, CD>,
  de: PipeFn<D, E, CD, CE>,
): (input: A, ctx: CA) => EnsurePromise<E>
function pipe<A, B, C, D, E, F, CA = Ctx, CB = CA, CC = CB, CD = CC, CE = CD, CF = CE>(
  ab: PipeFn<A, B, CA, CB>,
  bc: PipeFn<B, C, CB, CC>,
  cd: PipeFn<C, D, CC, CD>,
  de: PipeFn<D, E, CD, CE>,
  ef: PipeFn<E, F, CE, CF>,
): (input: A, ctx: CA) => EnsurePromise<F>
function pipe<A, B, C, D, E, F, G, CA = Ctx, CB = CA, CC = CB, CD = CC, CE = CD, CF = CE, CG = CF>(
  ab: PipeFn<A, B, CA, CB>,
  bc: PipeFn<B, C, CB, CC>,
  cd: PipeFn<C, D, CC, CD>,
  de: PipeFn<D, E, CD, CE>,
  ef: PipeFn<E, F, CE, CF>,
  fg: PipeFn<F, G, CF, CG>,
): (input: A, ctx: CA) => EnsurePromise<G>
function pipe<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  CA = Ctx,
  CB = CA,
  CC = CB,
  CD = CC,
  CE = CD,
  CF = CE,
  CG = CF,
  CH = CG,
>(
  ab: PipeFn<A, B, CA, CB>,
  bc: PipeFn<B, C, CB, CC>,
  cd: PipeFn<C, D, CC, CD>,
  de: PipeFn<D, E, CD, CE>,
  ef: PipeFn<E, F, CE, CF>,
  fg: PipeFn<F, G, CF, CG>,
  gh: PipeFn<G, H, CG, CH>,
): (input: A, ctx: CA) => EnsurePromise<H>
function pipe<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  CA = Ctx,
  CB = CA,
  CC = CB,
  CD = CC,
  CE = CD,
  CF = CE,
  CG = CF,
  CH = CG,
  CI = CH,
>(
  ab: PipeFn<A, B, CA, CB>,
  bc: PipeFn<B, C, CB, CC>,
  cd: PipeFn<C, D, CC, CD>,
  de: PipeFn<D, E, CD, CE>,
  ef: PipeFn<E, F, CE, CF>,
  fg: PipeFn<F, G, CF, CG>,
  gh: PipeFn<G, H, CG, CH>,
  hi: PipeFn<H, I, CH, CI>,
): (input: A, ctx: CA) => EnsurePromise<I>
function pipe<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  CA = Ctx,
  CB = CA,
  CC = CB,
  CD = CC,
  CE = CD,
  CF = CE,
  CG = CF,
  CH = CG,
  CI = CH,
  CJ = CI,
>(
  ab: PipeFn<A, B, CA, CB>,
  bc: PipeFn<B, C, CB, CC>,
  cd: PipeFn<C, D, CC, CD>,
  de: PipeFn<D, E, CD, CE>,
  ef: PipeFn<E, F, CE, CF>,
  fg: PipeFn<F, G, CF, CG>,
  gh: PipeFn<G, H, CG, CH>,
  hi: PipeFn<H, I, CH, CI>,
  ij: PipeFn<I, J, CI, CJ>,
): (input: A, ctx: CA) => EnsurePromise<J>
function pipe<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  CA = Ctx,
  CB = CA,
  CC = CB,
  CD = CC,
  CE = CD,
  CF = CE,
  CG = CF,
  CH = CG,
  CI = CH,
  CJ = CI,
  CK = CJ,
>(
  ab: PipeFn<A, B, CA, CB>,
  bc: PipeFn<B, C, CB, CC>,
  cd: PipeFn<C, D, CC, CD>,
  de: PipeFn<D, E, CD, CE>,
  ef: PipeFn<E, F, CE, CF>,
  fg: PipeFn<F, G, CF, CG>,
  gh: PipeFn<G, H, CG, CH>,
  hi: PipeFn<H, I, CH, CI>,
  ij: PipeFn<I, J, CI, CJ>,
  jk: PipeFn<J, K, CJ, CK>,
): (input: A, ctx: CA) => EnsurePromise<K>
function pipe<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  CA = Ctx,
  CB = CA,
  CC = CB,
  CD = CC,
  CE = CD,
  CF = CE,
  CG = CF,
  CH = CG,
  CI = CH,
  CJ = CI,
  CK = CJ,
  CL = CK,
>(
  ab: PipeFn<A, B, CA, CB>,
  bc: PipeFn<B, C, CB, CC>,
  cd: PipeFn<C, D, CC, CD>,
  de: PipeFn<D, E, CD, CE>,
  ef: PipeFn<E, F, CE, CF>,
  fg: PipeFn<F, G, CF, CG>,
  gh: PipeFn<G, H, CG, CH>,
  hi: PipeFn<H, I, CH, CI>,
  ij: PipeFn<I, J, CI, CJ>,
  jk: PipeFn<J, K, CJ, CK>,
  kl: PipeFn<K, L, CK, CL>,
): (input: A, ctx: CA) => EnsurePromise<L>
function pipe<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  CA = Ctx,
  CB = CA,
  CC = CB,
  CD = CC,
  CE = CD,
  CF = CE,
  CG = CF,
  CH = CG,
  CI = CH,
  CJ = CI,
  CK = CJ,
  CL = CK,
  CM = CL,
>(
  ab: PipeFn<A, B, CA, CB>,
  bc: PipeFn<B, C, CB, CC>,
  cd: PipeFn<C, D, CC, CD>,
  de: PipeFn<D, E, CD, CE>,
  ef: PipeFn<E, F, CE, CF>,
  fg: PipeFn<F, G, CF, CG>,
  gh: PipeFn<G, H, CG, CH>,
  hi: PipeFn<H, I, CH, CI>,
  ij: PipeFn<I, J, CI, CJ>,
  jk: PipeFn<J, K, CJ, CK>,
  kl: PipeFn<K, L, CK, CL>,
  lm: PipeFn<L, M, CL, CM>,
): (input: A, ctx: CA) => EnsurePromise<M>
function pipe(...args: unknown[]): unknown {
  const functions = args as PipeFn<unknown, unknown, Ctx>[]

  return async function (input: unknown, ctx: Ctx) {
    let lastResult = input
    for (let fn of functions) {
      lastResult = await fn(lastResult, ctx)
      if (isResultWithContext(lastResult)) {
        ctx = lastResult.ctx as Ctx
        lastResult = lastResult.value
      }
    }
    return lastResult
  }
}

interface ResolverAuthorize {
  <T, C = Ctx>(...args: Parameters<SessionContextBase["$authorize"]>): (
    input: T,
    ctx: C,
  ) => ResultWithContext<T, MiddlewareCtx>
}

const authorize: ResolverAuthorize = (...args) => {
  return function _innerAuthorize(input, ctx) {
    if (globalThis.__BLITZ_AUTH_ENABLED) {
      const session: SessionContext = (ctx as any).session
      session.$authorize(...args)
      return {
        __blitz: true,
        value: input,
        // we could use {...ctx, session} instead of `as any` just for TypeScript's sake
        ctx: ctx as any,
      }
    }
    log.warn(
      "You are using the `authorize` resolver, but `@blitzjs/auth` plugin is not initialised. Consider switching to enable authentication features.",
    )
    return {
      __blitz: true,
      value: input,
      ctx: ctx as any,
    }
  }
}

function zod<Schema extends ZodTypeAny, InputType = zInput<Schema>, OutputType = zOutput<Schema>>(
  schema: Schema,
  parserType: "sync",
): (input: InputType) => OutputType
function zod<Schema extends ZodTypeAny, InputType = zInput<Schema>, OutputType = zOutput<Schema>>(
  schema: Schema,
  parserType: "async",
): (input: InputType) => Promise<OutputType>
function zod<Schema extends ZodTypeAny, InputType = zInput<Schema>, OutputType = zOutput<Schema>>(
  schema: Schema,
): (input: InputType) => Promise<OutputType>
function zod<Schema extends ZodTypeAny, InputType = zInput<Schema>, OutputType = zOutput<Schema>>(
  schema: Schema,
  parserType: ParserType = "async",
) {
  if (parserType === "sync") {
    return (input: InputType): OutputType => schema.parse(input)
  } else {
    return (input: InputType): Promise<OutputType> => schema.parseAsync(input)
  }
}

export const resolver = {
  pipe,
  zod,
  authorize,
}
