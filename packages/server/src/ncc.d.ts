// From https://gist.github.com/cinderblock/e25cc7ddc201625fd00449a27c8fe0bf
declare module "@vercel/ncc" {
  /**
   * Options except watch.
   */
  type Options = {
    /**
     * Provide a custom cache path or disable caching.
     */
    cache?: string | false

    /**
     * Externals to leave as requires of the build.
     */
    externals?: string[]

    /**
     * Directory outside of which never to emit assets.
     *
     * @default process.cwd()
     */
    filterAssetBase?: string

    /**
     * @default false
     */
    minify?: boolean

    /**
     * @default false
     */
    sourceMap?: boolean

    /**
     * Default treats sources as output-relative.
     *
     * @default '../'
     */
    sourceMapBasePrefix?: string

    /**
     * When outputting a sourcemap, automatically include
     * source-map-support in the output file (increases output by 32kB).
     *
     * @default true
     */
    sourceMapRegister?: boolean

    /**
     * @default false
     */
    v8cache?: boolean

    /**
     * @default false
     */
    quiet?: boolean

    /**
     * @default false
     */
    debugLog?: boolean
  }

  type Assets = {
    [filename: string]: {
      source: Buffer
      permissions: number
      symlinks: unknown // TODO: fix type
    }
  }

  type Result = {code: string; map: string; assets: Assets}

  function ncc(input: string, options: Options & {watch?: false}): Promise<Result>

  function ncc(
    input: string,
    options: Options & {watch: true},
  ): {
    /**
     * Handler re-run on each build completion
     * watch errors are reported on "err".
     */
    handler(data: {err: Error} | Result): void

    /**
     * Handler re-run on each rebuild start.
     */
    rebuild(): void

    /**
     * Close the watcher.
     */
    close(): void
  }

  export = ncc
}
