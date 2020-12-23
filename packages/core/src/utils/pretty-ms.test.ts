import {prettyMs} from "./pretty-ms"

describe("prettyMs", () => {
  it("returns pretty strings", () => {
    expect(prettyMs(-1)).toMatchInlineSnapshot(`"-1ms"`)
    expect(prettyMs(0)).toMatchInlineSnapshot(`"0ms"`)
    expect(prettyMs(1000)).toMatchInlineSnapshot(`"1s"`)
    expect(prettyMs(1000)).toMatchInlineSnapshot(`"1s"`)
    expect(prettyMs(1600)).toMatchInlineSnapshot(`"1.6s"`)
    expect(prettyMs(1500)).toMatchInlineSnapshot(`"1.5s"`)
    expect(prettyMs(1666)).toMatchInlineSnapshot(`"1.7s"`)
  })
})
