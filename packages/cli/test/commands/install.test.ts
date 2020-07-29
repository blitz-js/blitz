import {Install, RecipeLocation} from "../../src/commands/install"
import * as path from "path"
import tempRecipe from "../__fixtures__/installer"

describe("`install` command", () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  it("runs local installer", async (done) => {
    jest.spyOn(tempRecipe, "run")
    await Install.run([path.resolve(__dirname, "../__fixtures__/installer")])
    expect(tempRecipe.run).toHaveBeenCalledWith({})
    done()
  })

  it("properly parses remote installer args", () => {
    const normalizePath = Install.prototype.normalizeRecipePath
    expect(normalizePath("test-installer")).toEqual({
      path: "https://github.com/blitz-js/blitz",
      subdirectory: "recipes/test-installer",
      location: RecipeLocation.Remote,
    })
    expect(normalizePath("user/test-installer")).toEqual({
      path: "https://github.com/user/test-installer",
      location: RecipeLocation.Remote,
    })
    expect(normalizePath("https://github.com/user/test-installer")).toEqual({
      path: "https://github.com/user/test-installer",
      location: RecipeLocation.Remote,
    })
  })
})
