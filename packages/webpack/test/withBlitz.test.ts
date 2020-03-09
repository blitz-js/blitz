import {withBlitz} from '../src'
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
describe('withBlitz', () => {
  it('alters the webpack config as expeted', () => {
    const nextConfigFn = withBlitz({})
    const newNext = nextConfigFn('', {defaultConfig: {}})
    const newWebpack = newNext.webpack({module: {rules: []}}, {})

    expect(newWebpack.module).toEqual({
      rules: [
        {
          test: /@prisma\/client/,
          use: 'null-loader',
        },
      ],
    })

    expect(newWebpack.resolve.plugins[0]).toBeInstanceOf(TsconfigPathsPlugin)
  })
})
