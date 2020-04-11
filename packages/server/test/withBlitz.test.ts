import {withBlitz} from '../src'

describe('withBlitz', () => {
  it('alters the webpack config as expeted', () => {
    const nextConfigFn = withBlitz({})
    const newNext = nextConfigFn('', {defaultConfig: {}})
    // const newWebpack = newNext.webpack({module: {rules: []}}, {})
    const newNextWithoutWebpack = Object.assign({}, newNext, {webpack: null})

    expect(newNextWithoutWebpack).toStrictEqual({experimental: {jsconfigPaths: true}, webpack: null})
  })
})
