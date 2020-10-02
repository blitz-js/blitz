import {dedent} from "../../src/utils/dedent"

describe("dedent", () => {
  it("strips leading spaces", () => {
    expect(dedent`   testing`).toBe("testing")
  })
})
