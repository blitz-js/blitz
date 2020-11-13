import {normalize} from "path"
import File from "vinyl"
import {mockStageArgs} from "../stage-test-utils"
import {testStreamItems} from "../stage-test-utils"
import {createStageRewriteImports, patternImport} from "."

describe("rewrite-imports", () => {
  describe("import regex pattern", () => {
    const successes = {
      'import "./bar/baz"': ['import "', "./bar/baz", '"'],
      [`import {
        foo,
        bar
      } from "./ding"`]: [
        `import {
        foo,
        bar
      } from "`,
        "./ding",
        '"',
      ],
      'import("../bar/baz")': ['import("', "../bar/baz", '")'],
      'import "app/bar/baz"': ['import "', "app/bar/baz", '"'],
      'import { foo, bar } from "app/ding"': ['import { foo, bar } from "', "app/ding", '"'],
      'import("app/bar/baz")': ['import("', "app/bar/baz", '")'],
      "import './bar/baz'": ["import '", "./bar/baz", "'"],
      "import './bar/baz';": ["import '", "./bar/baz", "'"],
      [`
      import { someFunction } from "app/pages/index";
      `]: ['import { someFunction } from "', "app/pages/index", '"'],
      'import Default from "app/some/file"': ['import Default from "', "app/some/file", '"'],
      'import {Suspense, useState} from "react"\n': [
        'import {Suspense, useState} from "',
        "react",
        '"',
      ],
      [`import db, {ProductCreateArgs} from "db"
      type CreateProductInput = {
        data: ProductCreateArgs["data"]
      }`]: ['import db, {ProductCreateArgs} from "', "db", '"'],
    }

    Object.entries(successes).forEach(([input, expectedOutput]) => {
      test(input, () => {
        expect(input.matchAll(patternImport).next().value.slice(1)).toEqual(expectedOutput)
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
})
