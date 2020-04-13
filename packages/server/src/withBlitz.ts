const withPlugins = require('next-compose-plugins')
const withTM = require('next-transpile-modules')(['@blitzjs/core'])
const merge = require('lodash.merge')

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
      },
      webpack(config: any, options: Record<any, any>) {
        if (!options.isServer) {
          merge(config, {
            module: {
              rules: [{test: /_rpc/, loader: require.resolve('null-loader')}],
            },
          })
        }

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }

        return config
      },
    }),
  )
}
