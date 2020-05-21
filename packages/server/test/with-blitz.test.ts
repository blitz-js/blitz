import {withBlitz} from '../src'

describe('withBlitz', () => {
  it('alters the webpack config as expected', () => {
    const nextConfigFn = withBlitz({})
    const newNext = nextConfigFn('', {defaultConfig: {}})
    // const newWebpack = newNext.webpack({module: {rules: []}}, {})
    const newNextWithoutWebpack = Object.assign({}, newNext, {webpack: null})

    expect(newNextWithoutWebpack).toStrictEqual({
      experimental: {
        reactMode: 'concurrent',
      },
      webpack: null,
    })
  })
})
