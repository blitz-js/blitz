import {normalize} from "path"
import File from "vinyl"
import {mockStageArgs} from "../stage-test-utils"
import {testStreamItems} from "../stage-test-utils"
import {createStageRewriteImports, patternImport} from "."

describe("rewrite-imports", () => {
  describe("import regex pattern", () => {
    const tests = [
      {
        input: `import {
          foo,
          bar
        } from "./ding"`,
        expected: [
          "import ",
          ,
          ,
          ,
          `{
          foo,
          bar
        }`,
          ' from "',
          "./ding",
          '"',
        ],
      },
      {
        input: 'import { foo, bar } from "app/ding"',
        expected: ["import ", , , , "{ foo, bar }", ' from "', "app/ding", '"'],
      },
      {
        input: `
        import { someFunction } from "app/pages/index";
        `,
        expected: ["import ", , , , "{ someFunction }", ' from "', "app/pages/index", '"'],
      },
      {
        input: 'import Default from "app/some/file"',
        expected: ["import ", , "Default", , , ' from "', "app/some/file", '"'],
      },
      {
        input: 'import {Suspense, useState} from "react"\n',
        expected: ["import ", , , , "{Suspense, useState}", ' from "', "react", '"'],
      },
      {
        input: `import db, {ProductCreateArgs} from "db"
        type CreateProductInput = {
          data: ProductCreateArgs["data"]
        }`,
        expected: ["import ", , "db", ", ", "{ProductCreateArgs}", ' from "', "db", '"'],
      },
    ]

    for (const {expected, input} of tests) {
      test(input, () => {
        expect(input.matchAll(patternImport).next().value.slice(1)).toEqual(expected)
      })
    }
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

  describe("an import from app/pages/index", () => {
    it(
      "is rewritten to pages/index",
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
              import { someFunction } from "app/pages/index";
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
              import { someFunction } from "pages/index";
              export function someOtherFunction() {
                return someFunction();
              }
            `,
          },
        ],
      }),
    )
  })

  describe("an import from app/users/api/getUser", () => {
    it(
      "is rewritten to pages/api/getUser",
      makeTest({
        input: [
          {
            path: normalize("/projects/blitz/blitz/app/users/api/getUser.ts"),
            contents: `
              export function someFunction() { return "foo"; }
              export default function Index() { return <p>Hello World</p> }
            `,
          },
          {
            path: normalize("/projects/blitz/blitz/app/anyFile.ts"),
            contents: `
              import { someFunction } from "app/users/api/getUser";
              export function someOtherFunction() {
                return someFunction();
              }
            `,
          },
        ],
        expectedOutput: [
          {
            path: normalize("/projects/blitz/blitz/app/users/api/getUser.ts"),
            contents: `
              export function someFunction() { return "foo"; }
              export default function Index() { return <p>Hello World</p> }
            `,
          },
          {
            path: normalize("/projects/blitz/blitz/app/anyFile.ts"),
            contents: `
              import { someFunction } from "pages/api/getUser";
              export function someOtherFunction() {
                return someFunction();
              }
            `,
          },
        ],
      }),
    )
  })

  describe("an import from app/users/queries/getUser", () => {
    it(
      "is rewritten to app/_resolvers/users/queries/getUser and app/users/queries/getUser",
      makeTest({
        input: [
          {
            path: normalize("/projects/blitz/blitz/app/anyFile.ts"),
            contents: `
import query, { someFunction } from "app/users/queries/getUser";
export function someOtherFunction() {
  return someFunction();
}
            `,
          },
        ],
        expectedOutput: [
          {
            path: normalize("/projects/blitz/blitz/app/anyFile.ts"),
            contents: `
import query from "app/users/queries/getUser"
import { someFunction } from "app/_resolvers/users/queries/getUser";
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
