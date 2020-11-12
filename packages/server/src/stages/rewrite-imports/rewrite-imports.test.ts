import {normalize} from "path"
import File from "vinyl"
import {mockStageArgs} from "../stage-test-utils"
import {testStreamItems} from "../stage-test-utils"
import {createStageRewriteImports, patternImport} from "."

describe("rewrite-imports", () => {
  describe("import regex pattern", () => {
    const successes = [
      'import "./bar/baz"',
      `import {
        foo,
        bar
      } from "./ding"`,
      'import("../bar/baz")',
      'import "app/bar/baz"',
      `import { foo, bar } from "app/ding"`,
      'import("app/bar/baz")',
      "import './bar/baz'",
      "import './bar/baz';",
      `
      import { someFunction } from "app/pages/index.tsx";
      `,
    ]

    successes.forEach((success) => {
      test(success, () => {
        expect(success.match(patternImport)).not.toBeNull()
      })
    })

    const fails = ['import { a, b } of "./bar/baz"']

    fails.forEach((fail) => {
      test(fail, () => {
        expect(fail.match(patternImport)).toBeNull()
      })
    })
  })

  function makeTest({
    input,
    expectedOutput,
  }: {
    input: {path: string; contents: string}[]
    expectedOutput: {path: string; contents: string}[]
  }) {
    return async () => {
      const {stream} = createStageRewriteImports(
        mockStageArgs({cwd: normalize("/projects/blitz/blitz")}),
      )

      input.forEach(({path, contents}) => {
        stream.write(new File({path, contents: Buffer.from(contents)}))
      })

      await testStreamItems(stream, expectedOutput, ({path, contents}: File) => ({
        path,
        contents: contents?.toString() || "",
      }))
    }
  }

  describe("an import from app/pages/index.tsx", () => {
    it(
      "is rewritten to pages/index.tsx",
      makeTest({
        input: [
          {
            path: normalize("/projects/blitz/blitz/app/pages/index.tsx"),
            contents: `
              export function someFunction() { return "foo"; }
              export default function Index() { return <p>Hello World</p> }
            `,
          },
          {
            path: normalize("/projects/blitz/blitz/app/anyFile.ts"),
            contents: `
              import { someFunction } from "app/pages/index.tsx";
              export function someOtherFunction() {
                return someFunction();
              }
            `,
          },
        ],
        expectedOutput: [
          {
            path: normalize("/projects/blitz/blitz/app/pages/index.tsx"),
            contents: `
              export function someFunction() { return "foo"; }
              export default function Index() { return <p>Hello World</p> }
            `,
          },
          {
            path: normalize("/projects/blitz/blitz/app/anyFile.ts"),
            contents: `
              import { someFunction } from "pages/index.tsx";
              export function someOtherFunction() {
                return someFunction();
              }
            `,
          },
        ],
      }),
    )
  })
})
