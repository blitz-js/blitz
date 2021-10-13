import {expect as oclifExpect, test as oclifTest} from "@oclif/test"
import * as path from "path"
import {Install, RecipeLocation} from "../../src/commands/install"
import tempRecipe from "../__fixtures__/installer"

describe("`install` command", () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  it("runs local installer", async () => {
    jest.spyOn(tempRecipe, "run")
    await Install.run([path.resolve(__dirname, "../__fixtures__/installer")])
    expect(tempRecipe.run).toHaveBeenCalledWith({})
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
  describe("run official recipes list flag ", () => {
    it("list of official recipes ", () => {
      const getOfficialRecipeList = Install.prototype.getOfficialRecipeList
      return getOfficialRecipeList().then((recipeList) => {
        expect(recipeList).toEqual(
          expect.arrayContaining([
            "base-web",
            "bumbag-ui",
            "chakra-ui",
            "emotion",
            "gh-action-yarn-mariadb",
            "gh-action-yarn-postgres",
            "ghost",
            "graphql-apollo-server",
            "logrocket",
            "material-ui",
            "quirrel",
            "reflexjs",
            "render",
            "secureheaders",
            "stitches",
            "styled-components",
            "tailwind",
            "theme-ui",
            "tsconfig.json",
          ]),
        )
      })
    })

    it("Show the table in the Recipe list", () => {
      const officialRecipeListTable = Install.prototype.officialRecipeListTable
      return officialRecipeListTable([
        "base-web",
        "bumbag-ui",
        "chakra-ui",
        "emotion",
        "gh-action-yarn-mariadb",
        "gh-action-yarn-postgres",
        "ghost",
        "graphql-apollo-server",
        "logrocket",
        "material-ui",
        "quirrel",
        "reflexjs",
        "render",
        "secureheaders",
        "stitches",
        "styled-components",
        "tailwind",
        "theme-ui",
        "tsconfig.json",
      ]).then((recipeList) => {
        expect(recipeList).toContain("official recipes")
        expect(recipeList).toContain("install recipe command")
        expect(recipeList).toContain("ghost")
        expect(recipeList).toContain("blitz install base-web")
      })
    })
  })
})
