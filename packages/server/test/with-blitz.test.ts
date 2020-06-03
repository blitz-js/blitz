import {withBlitz} from '../src'

describe('withBlitz', () => {
  it('alters the webpack config as expected', () => {
    const nextConfigFn = withBlitz({
      foo: 'bar',
    })
    const newNext = nextConfigFn('', {defaultConfig: {}})
    const newNextWithoutWebpack = Object.assign({}, newNext, {webpack: null})

    expect(newNextWithoutWebpack).toStrictEqual({
      foo: 'bar',
      experimental: {
        reactMode: 'concurrent',
      },
      webpack: null,
    })
  })

  it('can handle functional next configs', () => {
    const nextConfigFn = withBlitz((phase: any) => ({phase, foo: 'bar'}))
    const newNext = nextConfigFn('foo', {defaultConfig: {}})
    const newNextWithoutWebpack = Object.assign({}, newNext, {webpack: null})

    expect(newNextWithoutWebpack).toStrictEqual({
      phase: 'foo',
      foo: 'bar',
      experimental: {
        reactMode: 'concurrent',
      },
      webpack: null,
    })
  })
})
