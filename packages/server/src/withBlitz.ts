const withPlugins = require('next-compose-plugins')
const withTM = require('next-transpile-modules')(['@blitzjs/core'])
// const resolveCwd = require('resolve-cwd')

class WebpackFileDirnamePlugin {
  apply(compiler: any) {
    compiler.hooks.compilation.tap('WebpackFileDirnamePlugin', (_: any, {normalModuleFactory}: any) => {
      const handler = (parser: any) => {
        const setModuleConstant = (expressionName: any, fn: Function) => {
          parser.hooks.expression.for(expressionName).tap('WebpackFileDirnamePlugin', () => {
            parser.state.current.addVariable(expressionName, JSON.stringify(fn(parser.state.module)))
            return true
          })
        }

        setModuleConstant('__filename', (module: any) => module.resource)
        setModuleConstant('__dirname', (module: any) => module.context)
      }

      normalModuleFactory.hooks.parser.for('javascript/auto').tap('WebpackFileDirnamePlugin', handler)
      normalModuleFactory.hooks.parser.for('javascript/dynamic').tap('WebpackFileDirnamePlugin', handler)
    })
  }
}

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

        config.plugins.push(new WebpackFileDirnamePlugin())

        // if (process.env.NODE_ENV === 'development' && options.isServer) {
        //   config.externals = config.externals || []
        //   config.externals.push({
        //     './.generated-prisma-client': resolveCwd('./db/.generated-prisma-client'),
        //   })
        // }

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }

        return config
      },
    }),
  )
}
