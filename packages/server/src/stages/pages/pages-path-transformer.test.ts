import {normalize} from "path"
import {pagesPathTransformer} from "."

describe("createPagesPathTransformer", () => {
  const tests = [
    {
      name: "extracts paths folder to the root in a basic transformation",
      input: normalize("app/modules/users/pages/one/two/three.tsx"),
      expected: normalize("pages/one/two/three.tsx"),
    },
    {
      name: "Transforms js",
      input: normalize("app/modules/users/pages/one/two/three.js"),
      expected: normalize("pages/one/two/three.js"),
    },
    {
      name: "Transforms ts",
      input: normalize("app/modules/users/pages/one/two/three.ts"),
      expected: normalize("pages/one/two/three.ts"),
    },
    {
      name: "Transforms jsx",
      input: normalize("app/modules/users/pages/one/two/three.jsx"),
      expected: normalize("pages/one/two/three.jsx"),
    },
    {
      name: "Transforms mjs",
      input: normalize("app/modules/users/pages/one/two/three.mjs"),
      expected: normalize("pages/one/two/three.mjs"),
    },
    {
      name: "Transforms mdx",
      input: normalize("app/modules/users/pages/one/two/three.mdx"),
      expected: normalize("pages/one/two/three.mdx"),
    },
    {
      name: "Ignores non tjsx paths: css",
      input: normalize("app/modules/users/pages/one/two/three.css"),
      expected: normalize("app/modules/users/pages/one/two/three.css"),
    },
    {
      name: "Ignores non tjsx paths: scss",
      input: normalize("app/modules/users/pages/one/two/three.scss"),
      expected: normalize("app/modules/users/pages/one/two/three.scss"),
    },
    {
      name: "Ignores test pages: tsx",
      input: normalize("app/modules/users/pages/one/two/three.test.tsx"),
      expected: normalize("app/modules/users/pages/one/two/three.test.tsx"),
    },
    {
      name: "handles leading /",
      input: normalize("/app/modules/users/pages/one/two/three.tsx"),
      expected: normalize("pages/one/two/three.tsx"),
    },
    {
      name: "handles nested pages folders",
      input: normalize("app/modules/users/pages/one/two/pages/three.tsx"),
      expected: normalize("pages/one/two/pages/three.tsx"),
    },
    {
      name: "ignores files outside of app",
      input: normalize("thing/users/pages/one/two/pages/three.tsx"),
      expected: normalize("thing/users/pages/one/two/pages/three.tsx"),
    },
    {
      name: "extracts paths folder to the root in a basic transformation",
      input: normalize("/User/foo/bar/app/modules/users/pages/one/two/three.tsx"),
      expected: normalize("pages/one/two/three.tsx"),
    },
    {
      name: "Transforms app/pages/test.tsx",
      input: normalize("app/pages/test.tsx"),
      expected: normalize("pages/test.tsx"),
    },
  ]

  tests.forEach(({name, input, expected}) => {
    it(name, () => {
      expect(pagesPathTransformer(input)).toEqual(expected)
    })
  })
})
