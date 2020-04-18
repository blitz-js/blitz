const withPlugins = require('next-compose-plugins')
const withTM = require('next-transpile-modules')(['@blitzjs/core'])
const resolveCwd = require('resolve-cwd')

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
        }

        config.resolve.alias.react = resolveCwd('react')

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }

        return config
      },
    }),
  )
}
