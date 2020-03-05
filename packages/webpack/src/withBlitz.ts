const withPlugins = require('next-compose-plugins')
const withTM = require('next-transpile-modules')(['@blitzjs/core'])
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

export function withBlitz(nextConfig: Record<any, any> = {}) {
  const plugins = []
  if (process.env.NODE_ENV === 'development') {
    // This is needed during monorepo development so that examples auto reload when packages change
    plugins.push(withTM)
  }

  return withPlugins(
    plugins,
    Object.assign({}, nextConfig, {
      webpack(config: any, options: Record<any, any>) {
        // Allows Next.js to use fancy paths from user's tsconfig.json
        // see https://github.com/zeit/next.js/issues/7935
        if (config.resolve.plugins) {
          config.resolve.plugins.push(new TsconfigPathsPlugin())
        } else {
          config.resolve.plugins = [new TsconfigPathsPlugin()]
        }

        if (!options.isServer) {
          // Ensure prisma client is not included in the client bundle
          config.module.rules.push({
            test: /@prisma\/client/,
            use: 'null-loader',
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
