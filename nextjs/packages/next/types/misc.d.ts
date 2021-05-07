/* eslint-disable import/no-extraneous-dependencies */
declare module 'next/dist/compiled/babel/plugin-transform-modules-commonjs'
declare module 'next/dist/compiled/babel/plugin-syntax-jsx'
declare module 'browserslist'
declare module 'cssnano-simple' {
  import { OldPlugin } from 'postcss'
  const cssnanoSimple: OldPlugin<{}>
  export = cssnanoSimple
}
declare module 'styled-jsx/server'

declare module 'next/dist/compiled/amphtml-validator' {
  import m from 'amphtml-validator'
  export = m
}
declare module 'next/dist/compiled/async-retry'
declare module 'next/dist/compiled/async-sema' {
  import m from 'async-sema'
  export = m
}
declare module 'next/dist/compiled/arg/index.js' {
  function arg<T extends arg.Spec>(
    spec: T,
    options?: { argv?: string[]; permissive?: boolean }
  ): arg.Result<T>

  namespace arg {
    export type Handler = (value: string) => any

    export interface Spec {
      [key: string]: string | Handler | [Handler]
    }

    export type Result<T extends Spec> = { _: string[] } & {
      [K in keyof T]: T[K] extends string
        ? never
        : T[K] extends Handler
        ? ReturnType<T[K]>
        : T[K] extends [Handler]
        ? Array<ReturnType<T[K][0]>>
        : never
    }
  }

  export = arg
}

declare module 'next/dist/compiled/babel/code-frame' {
  export * from '@babel/code-frame'
}
declare module 'next/dist/compiled/babel/traverse' {
  import traverse from '@babel/traverse'
  export default traverse
  export * from '@babel/traverse'
}
declare module 'next/dist/compiled/babel/generator' {
  import generate from '@babel/generator'
  export default generate
  export * from '@babel/generator'
}
declare module 'next/dist/compiled/babel/preset-env' {
  const anyType: any
  export default anyType
}
declare module 'next/dist/compiled/babel/core' {
  export * from '@babel/core'
}

declare module 'next/dist/compiled/babel/core-lib-config'
declare module 'next/dist/compiled/babel/core-lib-normalize-file'
declare module 'next/dist/compiled/babel/core-lib-normalize-opts'
declare module 'next/dist/compiled/babel/core-lib-block-hoist-plugin'
declare module 'next/dist/compiled/babel/core-lib-plugin-pass'

declare module 'next/dist/compiled/ci-info' {
  import m from 'ci-info'
  export = m
}
declare module 'next/dist/compiled/compression' {
  import m from 'compression'
  export = m
}
declare module 'next/dist/compiled/conf' {
  import m from 'conf'
  export = m
}
declare module 'next/dist/compiled/content-type' {
  import m from 'content-type'
  export = m
}
declare module 'next/dist/compiled/cookie' {
  import m from 'cookie'
  export = m
}
declare module 'next/dist/compiled/debug' {
  import m from 'debug'
  export = m
}
declare module 'next/dist/compiled/devalue' {
  import m from 'devalue'
  export = m
}
declare module 'next/dist/compiled/escape-string-regexp' {
  import m from 'escape-string-regexp'
  export = m
}
declare module 'next/dist/compiled/find-up' {
  import m from 'find-up'
  export = m
}
declare module 'next/dist/compiled/fresh' {
  import m from 'fresh'
  export = m
}
declare module 'next/dist/compiled/gzip-size' {
  import m from 'gzip-size'
  export = m
}
declare module 'next/dist/compiled/http-proxy' {
  import m from 'http-proxy'
  export = m
}
declare module 'next/dist/compiled/is-docker' {
  import m from 'is-docker'
  export = m
}
declare module 'next/dist/compiled/is-wsl' {
  import m from 'is-wsl'
  export = m
}
declare module 'next/dist/compiled/json5' {
  import m from 'json5'
  export = m
}
declare module 'next/dist/compiled/jsonwebtoken' {
  import m from 'jsonwebtoken'
  export = m
}
declare module 'next/dist/compiled/lodash.curry' {
  // import m from 'lodash.curry'
  // export = m

  /*
   *  Blitz: inlining the types here because build was unable to pull types from lodash.curry
   */
  export interface CurriedFunction1<T1, R> {
    (): CurriedFunction1<T1, R>
    (t1: T1): R
  }
  export interface CurriedFunction2<T1, T2, R> {
    (): CurriedFunction2<T1, T2, R>
    (t1: T1): CurriedFunction1<T2, R>
    (t1: __, t2: T2): CurriedFunction1<T1, R>
    (t1: T1, t2: T2): R
  }
  export interface CurriedFunction3<T1, T2, T3, R> {
    (): CurriedFunction3<T1, T2, T3, R>
    (t1: T1): CurriedFunction2<T2, T3, R>
    (t1: __, t2: T2): CurriedFunction2<T1, T3, R>
    (t1: T1, t2: T2): CurriedFunction1<T3, R>
    (t1: __, t2: __, t3: T3): CurriedFunction2<T1, T2, R>
    (t1: T1, t2: __, t3: T3): CurriedFunction1<T2, R>
    (t1: __, t2: T2, t3: T3): CurriedFunction1<T1, R>
    (t1: T1, t2: T2, t3: T3): R
  }
  interface Curry {
    <T1, R>(func: (t1: T1) => R, arity?: number): CurriedFunction1<T1, R>
    <T1, T2, R>(func: (t1: T1, t2: T2) => R, arity?: number): CurriedFunction2<
      T1,
      T2,
      R
    >
    <T1, T2, T3, R>(
      func: (t1: T1, t2: T2, t3: T3) => R,
      arity?: number
    ): CurriedFunction3<T1, T2, T3, R>
    (func: (...args: any[]) => any, arity?: number): (...args: any[]) => any
    placeholder: __
  }
  const curry: Curry
  export = curry
}
declare module 'next/dist/compiled/lru-cache' {
  import m from 'lru-cache'
  export = m
}
declare module 'next/dist/compiled/nanoid/index.cjs' {
  import m from 'nanoid'
  export = m
}
declare module 'next/dist/compiled/ora' {
  import m from 'ora'
  export = m
}
declare module 'next/dist/compiled/path-to-regexp' {
  import m from 'path-to-regexp'
  export = m
}
declare module 'next/dist/compiled/recast' {
  import m from 'recast'
  export = m
}
declare module 'next/dist/compiled/send' {
  import m from 'send'
  export = m
}
declare module 'next/dist/compiled/source-map' {
  import m from 'source-map'
  export = m
}
declare module 'next/dist/compiled/string-hash' {
  import m from 'string-hash'
  export = m
}
declare module 'next/dist/compiled/strip-ansi' {
  import m from 'strip-ansi'
  export = m
}
declare module 'next/dist/compiled/terser' {
  import m from 'terser'
  export = m
}
declare module 'next/dist/compiled/semver' {
  import m from 'semver'
  export = m
}
declare module 'next/dist/compiled/postcss-scss' {
  import m from 'postcss-scss'
  export = m
}
declare module 'next/dist/compiled/text-table' {
  function textTable(
    rows: Array<Array<{}>>,
    opts?: {
      hsep?: string
      align?: Array<'l' | 'r' | 'c' | '.'>
      stringLength?(str: string): number
    }
  ): string

  export = textTable
}
declare module 'next/dist/compiled/unistore' {
  import m from 'unistore'
  export = m
}
declare module 'next/dist/compiled/web-vitals' {
  import m from 'web-vitals'
  export = m
}

declare module 'next/dist/compiled/comment-json' {
  import m from 'comment-json'
  export = m
}

declare module 'pnp-webpack-plugin' {
  import webpack from 'webpack'

  class PnpWebpackPlugin extends webpack.Plugin {}

  export = PnpWebpackPlugin
}

declare module NodeJS {
  interface ProcessVersions {
    pnp?: string
  }
  interface Process {
    crossOrigin?: string
  }
}

declare module 'watchpack' {
  import { EventEmitter } from 'events'

  class Watchpack extends EventEmitter {
    constructor(options?: any)
    watch(files: string[], directories: string[], startTime?: number): void
    close(): void

    getTimeInfoEntries(): Map<
      string,
      { safeTime: number; timestamp: number; accuracy?: number }
    >
  }

  export default Watchpack
}
