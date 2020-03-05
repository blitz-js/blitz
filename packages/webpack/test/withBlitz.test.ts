import {withBlitz} from '../src'

describe('withBlitz', () => {
  it('alters the webpack config as expeted', () => {
    const nextConfigFn = withBlitz({})
    const newNext = nextConfigFn('', {defaultConfig: {}})
    const newWebpack = newNext.webpack({module: {rules: []}}, {})
    expect(newWebpack).toEqual({
      module: {
        rules: [
          {
            test: /@prisma\/client/,
            use: 'null-loader',
          },
        ],
      },
    })
  })
})
