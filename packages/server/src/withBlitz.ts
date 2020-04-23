const withPlugins = require('next-compose-plugins')
const withTM = require('next-transpile-modules')(['@blitzjs/core'])

export function withBlitz(nextConfig: Record<any, any> = {}) {
  const plugins = []
  if (process.env.NODE_ENV === 'development') {
    // This is needed during monorepo development so that examples auto reload when packages change
    plugins.push(withTM)
  }

  return withPlugins(
    plugins,
    Object.assign({}, nextConfig, {
      experimental: {
        jsconfigPaths: true,
        reactMode: 'concurrent',
      },
      webpack(config: any, options: Record<any, any>) {
        if (!options.isServer) {
          config.module = config.module || {}
          config.module.rules = config.module.rules || []
          config.module.rules.push({test: /_rpc/, loader: require.resolve('null-loader')})
          config.module.rules.push({
            test: /@blitzjs\/server/,
            use: 'null-loader',
          })
        }

        // This is needed because, for an unknown reason, the next build fails when
        // importing directly from the `blitz` package, complaining about child_processs
        // Somehow our server code is getting into the next build that way.
        // This alias eliminates that problem.
        // Anyone is welcome to investigate this further sometime
        config.resolve.alias.blitz = '@blitzjs/core'

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }
        return config
      },
    }),
  )
}
