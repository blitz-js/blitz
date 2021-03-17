/* eslint-env jest */
function interopRequireDefault(mod) {
  return mod.default || mod
}

const loader = interopRequireDefault(
  require('next/dist/build/webpack/loaders/next-babel-loader')
)
const os = require('os')
const path = require('path')

const dir = path.resolve(os.tmpdir())

const babel = async (
  code,
  { isServer = false, resourcePath = 'index.js', development = false } = {}
) => {
  let isAsync = false
  return new Promise((resolve, reject) => {
    function callback(err, content) {
      if (err) {
        reject(err)
      } else {
        resolve(content)
      }
    }

    const res = loader.bind({
      resourcePath,
      async() {
        isAsync = true
        return callback
      },
      callback,
      emitWarning() {},
      query: {
        // babel opts
        babelrc: false,
        configFile: false,
        sourceType: 'module',
        compact: true,
        caller: {
          name: 'tests',
          supportsStaticESM: true,
        },
        // loader opts
        cwd: dir,
        isServer,
        distDir: path.resolve(dir, '.next'),
        pagesDir: path.resolve(dir, 'pages'),
        cache: false,
        babelPresetPlugins: [],
        development,
        hasReactRefresh: Boolean(!isServer && development),
      },
    })(code, null)

    if (!isAsync) {
      resolve(res)
    }
  })
}

describe('next-babel-loader', () => {
  describe('replace constants', () => {
    it('should replace typeof window expression nested', async () => {
      const code = await babel('function a(){console.log(typeof window)}')
      expect(code).toMatchInlineSnapshot(
        `"function a(){console.log(\\"object\\");}"`
      )
    })

    it('should replace typeof window expression top level (client)', async () => {
      const code = await babel('typeof window;')
      expect(code).toMatchInlineSnapshot(`"\\"object\\";"`)
    })

    it('should replace typeof window expression top level (server)', async () => {
      const code = await babel('typeof window;', { isServer: true })
      expect(code).toMatchInlineSnapshot(`"\\"undefined\\";"`)
    })

    it('should replace typeof window in === expression nested', async () => {
      const code = await babel(
        `function a(){console.log(typeof window === 'undefined')}`
      )
      expect(code).toMatchInlineSnapshot(`"function a(){console.log(false);}"`)
    })

    it('should replace typeof window expression top level', async () => {
      const code = await babel(`typeof window === 'undefined';`)
      expect(code).toMatchInlineSnapshot(`"false;"`)
    })

    it('should replace typeof window in === expression top level', async () => {
      const code = await babel(`typeof window === 'object';`)
      expect(code).toMatchInlineSnapshot(`"true;"`)
    })

    it('should replace typeof window in !== expression top level', async () => {
      const code = await babel(`typeof window !== 'undefined';`)
      expect(code).toMatchInlineSnapshot(`"true;"`)
    })

    it('should replace typeof window expression !== object top level', async () => {
      const code = await babel(`typeof window !== 'object';`)
      expect(code).toMatchInlineSnapshot(`"false;"`)
    })

    it('should replace typeof window expression top level serverside', async () => {
      const code = await babel(`typeof window !== 'undefined';`, {
        isServer: true,
      })
      expect(code).toMatchInlineSnapshot(`"false;"`)
    })

    it('should replace typeof window expression !== object top level serverside', async () => {
      const code = await babel(`typeof window !== 'object';`, {
        isServer: true,
      })
      expect(code).toMatchInlineSnapshot(`"true;"`)
    })

    it('should replace process.browser (1)', async () => {
      const code = await babel(`process.browser`, {
        isServer: false,
      })
      expect(code).toMatchInlineSnapshot(`"true;"`)
    })

    it('should replace process.browser (2)', async () => {
      const code = await babel(`process.browser`, {
        isServer: true,
      })
      expect(code).toMatchInlineSnapshot(`"false;"`)
    })

    it('should replace process.browser (3)', async () => {
      const code = await babel(`process.browser == false`, {
        isServer: true,
      })
      expect(code).toMatchInlineSnapshot(`"true;"`)
    })

    it('should replace process.browser (4)', async () => {
      const code = await babel(`if (process.browser === false) {}`, {
        isServer: true,
      })
      expect(code).toMatchInlineSnapshot(`"if(true){}"`)
    })

    it('should replace process.browser (5)', async () => {
      const code = await babel(`if (process.browser) {}`, {
        isServer: true,
      })
      expect(code).toMatchInlineSnapshot(`"if(false){}"`)
    })

    it('should replace NODE_ENV on client (dev)', async () => {
      const code = await babel(`process.env.NODE_ENV`, {
        isServer: false,
        development: true,
      })
      expect(code).toMatchInlineSnapshot(`"\\"development\\";"`)
    })

    it('should replace NODE_ENV on client (prod)', async () => {
      const code = await babel(`process.env.NODE_ENV`, {
        isServer: false,
        development: false,
      })
      expect(code).toMatchInlineSnapshot(`"\\"production\\";"`)
    })

    it('should replace NODE_ENV on server', async () => {
      const code = await babel(`process.env.NODE_ENV`, {
        isServer: true,
      })
      expect(code).toMatchInlineSnapshot(`"\\"production\\";"`)
    })

    it('should replace NODE_ENV in statement (dev)', async () => {
      const code = await babel(
        `if (process.env.NODE_ENV === 'development') {}`,
        { development: true }
      )
      expect(code).toMatchInlineSnapshot(`"if(true){}"`)
    })

    it('should replace NODE_ENV in === statement (prod)', async () => {
      const code = await babel(`if (process.env.NODE_ENV === 'production') {}`)
      expect(code).toMatchInlineSnapshot(`"if(true){}"`)
    })

    it('should replace NODE_ENV in !== statement (prod)', async () => {
      const code = await babel(`if (process.env.NODE_ENV !== 'production') {}`)
      expect(code).toMatchInlineSnapshot(`"if(false){}"`)
    })

    it('should not drop unused exports by default', async () => {
      const code = await babel(
        // effectful
        `import"core-js";` +
          // basic
          `import{foo,bar}from"a";import baz from"b";` +
          // complex
          `import * as React from "react";` +
          `import baz2,{yeet}from"c";` +
          `import baz3,{cats}from"d";` +
          `import{c,d}from"e";` +
          `import{e as ee,f as ff}from"f";`
      )
      expect(code).toMatchInlineSnapshot(
        `"import\\"core-js\\";import{foo,bar}from\\"a\\";import baz from\\"b\\";import*as React from\\"react\\";import baz2,{yeet}from\\"c\\";import baz3,{cats}from\\"d\\";import{c,d}from\\"e\\";import{e as ee,f as ff}from\\"f\\";"`
      )
    })

    const pageFile = path.resolve(dir, 'pages', 'index.js')
    const tsPageFile = pageFile.replace(/\.js$/, '.ts')

    it('should not drop unused exports by default in a page', async () => {
      const code = await babel(
        // effectful
        `import"core-js";` +
          // basic
          `import{foo,bar}from"a";import baz from"b";` +
          // complex
          `import*as React from"react";` +
          `import baz2,{yeet}from"c";` +
          `import baz3,{cats}from"d";` +
          `import{c,d}from"e";` +
          `import{e as ee,f as ff}from"f";`,
        { resourcePath: pageFile }
      )
      expect(code).toMatchInlineSnapshot(
        `"import\\"core-js\\";import{foo,bar}from\\"a\\";import baz from\\"b\\";import*as React from\\"react\\";import baz2,{yeet}from\\"c\\";import baz3,{cats}from\\"d\\";import{c,d}from\\"e\\";import{e as ee,f as ff}from\\"f\\";"`
      )
    })

    it('should drop unused exports in a modern-apis page', async () => {
      const code = await babel(
        // effectful
        `import"core-js";` +
          // basic
          `import{foo,bar}from"a";import baz from"b";` +
          // complex
          `import*as React from"react";` +
          `import baz2,{yeet}from"c";` +
          `import baz3,{cats}from"d";` +
          `import{c,d}from"e";` +
          `import{e as ee,f as ff}from"f";` +
          `` +
          `export function getStaticProps() {foo;bar;baz;cats;baz2;ff; return { props: {} } }`,
        { resourcePath: pageFile }
      )
      expect(code).toMatchInlineSnapshot(
        `"import\\"core-js\\";import*as React from\\"react\\";import{yeet}from\\"c\\";import baz3 from\\"d\\";import{c,d}from\\"e\\";import{e as ee}from\\"f\\";"`
      )
    })

    it('should keep used exports in a modern-apis page (server)', async () => {
      const code = await babel(
        // effectful
        `import"core-js";` +
          // basic
          `import{foo,bar}from"a";import baz from"b";import ooo from"ooo";` +
          // complex
          `import*as React from"react";` +
          `import baz2,{yeet}from"c";` +
          `import baz3,{cats}from"d";` +
          `import{c,d}from"e";` +
          `import{e as ee,f as ff}from"f";` +
          `` +
          `export function getStaticProps() {foo();baz2();ff();ooo(); return { props: {} }}` +
          `export default function () { return bar(); }`,
        { resourcePath: pageFile, isServer: true }
      )
      expect(code).toMatchInlineSnapshot(
        `"import\\"core-js\\";import{foo,bar}from\\"a\\";import baz from\\"b\\";import ooo from\\"ooo\\";import*as React from\\"react\\";import baz2,{yeet}from\\"c\\";import baz3,{cats}from\\"d\\";import{c,d}from\\"e\\";import{e as ee,f as ff}from\\"f\\";export function getStaticProps(){foo();baz2();ff();ooo();return{props:{}};}export default function(){return bar();}"`
      )
    })

    it('should keep used exports in a modern-apis page (client)', async () => {
      const code = await babel(
        // effectful
        `import"core-js";` +
          // basic
          `import{foo,bar}from"a";import baz from"b";import ooo from"ooo";` +
          // complex
          `import*as React from"react";` +
          `import baz2,{yeet}from"c";` +
          `import baz3,{cats}from"d";` +
          `import{c,d}from"e";` +
          `import{e as ee,f as ff}from"f";` +
          `` +
          `export function getStaticProps() {foo();baz2();ff();ooo();cats; return { props: {} }}` +
          `export default function () { return cats + bar(); }`,
        { resourcePath: pageFile, isServer: false }
      )
      expect(code).toMatchInlineSnapshot(
        `"import\\"core-js\\";import{bar}from\\"a\\";import baz from\\"b\\";import*as React from\\"react\\";import{yeet}from\\"c\\";import baz3,{cats}from\\"d\\";import{c,d}from\\"e\\";import{e as ee}from\\"f\\";export var __N_SSG=true;export default function(){return cats+bar();}"`
      )
    })

    it('should keep used exports and react in a modern-apis page with JSX (client)', async () => {
      const code = await babel(
        // effectful
        `import"core-js";` +
          // basic
          `import{foo,bar}from"a";import baz from"b";import ooo from"ooo";` +
          // complex
          `import*as React from"react";` +
          `import baz2,{yeet}from"c";` +
          `import baz3,{cats}from"d";` +
          `import{c,d}from"e";` +
          `import{e as ee,f as ff}from"f";` +
          `` +
          `export function getStaticProps() {foo();baz2();ff();ooo(); return { props: {} }}` +
          `export default function () { return <div>{cats + bar()}</div> }`,
        { resourcePath: pageFile, isServer: false }
      )
      expect(code).toMatchInlineSnapshot(
        `"var __jsx=React.createElement;import\\"core-js\\";import{bar}from\\"a\\";import baz from\\"b\\";import*as React from\\"react\\";import{yeet}from\\"c\\";import baz3,{cats}from\\"d\\";import{c,d}from\\"e\\";import{e as ee}from\\"f\\";export var __N_SSG=true;export default function(){return __jsx(\\"div\\",null,cats+bar());}"`
      )
    })

    it('should support 9.4 regression', async () => {
      const output = await babel(
        `
          import React from "react";
          import queryGraphql from "../graphql/schema";

          const gql = String.raw;

          export default function Home({ greeting }) {
            return <h1>{greeting}</h1>;
          }

          export async function getStaticProps() {
            const greeting = await getGreeting();

            return {
              props: {
                greeting,
              },
            };
          }

          async function getGreeting() {
            const result = await queryGraphql(
              gql\`
                {
                  query {
                    greeting
                  }
                }
              \`
            );

            return result.data.greeting;
          }
        `,
        { resourcePath: pageFile, isServer: false, development: true }
      )

      expect(output).toMatch(
        /var _jsxFileName="[^"]+";var __jsx=React\.createElement;import React from"react";export var __N_SSG=true;export default function Home\(_ref\)\{var greeting=_ref\.greeting;return __jsx\("h1",\{__self:this,__source:\{fileName:_jsxFileName,lineNumber:8,columnNumber:20\}\},greeting\);\}_c=Home;var _c;\$RefreshReg\$\(_c,"Home"\);/
      )
    })

    it('should support optional chaining for JS file', async () => {
      const code = await babel(
        `let hello;` +
          `export default () => hello?.world ? 'something' : 'nothing' `,
        {
          resourcePath: pageFile,
        }
      )
      expect(code).toMatchInlineSnapshot(
        `"var hello;export default(function(){return hello!==null&&hello!==void 0&&hello.world?'something':'nothing';});"`
      )
    })

    it('should support optional chaining for TS file', async () => {
      const code = await babel(
        `let hello;` +
          `export default () => hello?.world ? 'something' : 'nothing' `,
        {
          resourcePath: tsPageFile,
        }
      )
      expect(code).toMatchInlineSnapshot(
        `"var hello;export default(function(){return hello!==null&&hello!==void 0&&hello.world?'something':'nothing';});"`
      )
    })

    it('should support nullish coalescing for JS file', async () => {
      const code = await babel(
        `const res = {
          status: 0,
          nullVal: null,
          statusText: '',

        }
        const status = res.status ?? 999
        const nullVal = res.nullVal ?? 'another'
        const statusText = res.nullVal ?? 'not found'
        export default () => 'hello'
        `,
        {
          resourcePath: pageFile,
        }
      )
      expect(code).toMatchInlineSnapshot(
        `"var _res$status,_res$nullVal,_res$nullVal2;var res={status:0,nullVal:null,statusText:''};var status=(_res$status=res.status)!==null&&_res$status!==void 0?_res$status:999;var nullVal=(_res$nullVal=res.nullVal)!==null&&_res$nullVal!==void 0?_res$nullVal:'another';var statusText=(_res$nullVal2=res.nullVal)!==null&&_res$nullVal2!==void 0?_res$nullVal2:'not found';export default(function(){return'hello';});"`
      )
    })

    it('should support nullish coalescing for TS file', async () => {
      const code = await babel(
        `const res = {
          status: 0,
          nullVal: null,
          statusText: '',

        }
        const status = res.status ?? 999
        const nullVal = res.nullVal ?? 'another'
        const statusText = res.nullVal ?? 'not found'
        export default () => 'hello'
        `,
        {
          resourcePath: tsPageFile,
        }
      )
      expect(code).toMatchInlineSnapshot(
        `"var _res$status,_res$nullVal,_res$nullVal2;var res={status:0,nullVal:null,statusText:''};var status=(_res$status=res.status)!==null&&_res$status!==void 0?_res$status:999;var nullVal=(_res$nullVal=res.nullVal)!==null&&_res$nullVal!==void 0?_res$nullVal:'another';var statusText=(_res$nullVal2=res.nullVal)!==null&&_res$nullVal2!==void 0?_res$nullVal2:'not found';export default(function(){return'hello';});"`
      )
    })
  })
})
