jest.mock("@blitzjs/config", () => {
  return {
    getConfig: jest.fn().mockReturnValue({}),
  }
})

import {withBlitz} from "../src/with-blitz"

describe("withBlitz", () => {
  it("alters the webpack config as expected", () => {
    const nextConfigFn = withBlitz({
      foo: "bar",
    })
    const newNext = nextConfigFn("", {defaultConfig: {}})
    const newNextWithoutWebpack = Object.assign({}, newNext, {
      webpack: null,
      webpackDevMiddleware: null,
    })

    expect(newNextWithoutWebpack).toStrictEqual({
      foo: "bar",
      experimental: {
        reactMode: "concurrent",
      },
      webpack: null,
      webpackDevMiddleware: null,
    })
  })

  it("can handle functional next configs", () => {
    const nextConfigFn = withBlitz((phase: any) => ({phase, foo: "bar"}))
    const newNext = nextConfigFn("foo", {defaultConfig: {}})
    const newNextWithoutWebpack = Object.assign({}, newNext, {
      webpack: null,
      webpackDevMiddleware: null,
    })

    expect(newNextWithoutWebpack).toStrictEqual({
      phase: "foo",
      foo: "bar",
      experimental: {
        reactMode: "concurrent",
      },
      webpack: null,
      webpackDevMiddleware: null,
    })
  })
})
