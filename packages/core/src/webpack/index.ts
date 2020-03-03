const withPlugins = require('next-compose-plugins')
const withTM = require('next-transpile-modules')(['@blitzjs/core'])

export default function(nextConfig: Record<any, any> = {}) {
  const plugins = []
  if (process.env.NODE_ENV === 'development') {
    // This is needed during monorepo development so that examples auto reload when packages change
    plugins.push(withTM)
  }

  return withPlugins(
    plugins,
    Object.assign({}, nextConfig, {
      webpack(config: any, options: Record<any, any>) {
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
