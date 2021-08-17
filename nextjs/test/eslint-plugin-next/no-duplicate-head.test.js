const rule = require('@next/eslint-plugin-next/lib/rules/no-duplicate-head')

const RuleTester = require('eslint').RuleTester

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
      jsx: true,
    },
  },
})

var ruleTester = new RuleTester()
ruleTester.run('no-duplicate-head', rule, {
  valid: [
    {
      code: `import Document, { Html, Head, Main, NextScript } from 'next/document'

      class MyDocument extends Document {
        static async getInitialProps(ctx) {
          //...
        }
      
        render() {
          return (
            <Html>
              <Head/>
            </Html>
          )
        }
      }
      
      export default MyDocument
    `,
      filename: 'pages/_document.js',
    },
    {
      code: `import Document, { Html, Head, Main, NextScript } from 'next/document'

      class MyDocument extends Document {      
        render() {
          return (
            <Html>
              <Head>
                <meta charSet="utf-8" />
                <link
                  href="https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,400;0,700;1,400;1,700&display=swap"
                  rel="stylesheet"
                />
              </Head>
            </Html>
          )
        }
      }
      
      export default MyDocument
    `,
      filename: 'pages/_document.tsx',
    },
  ],
  invalid: [
    {
      code: `
      import Document, { Html, Main, NextScript } from 'next/document'
      import Head from 'next/head'
      
      class MyDocument extends Document {
        render() {
          return (
            <Html>
              <Head />
              <Head />
              <Head />
            </Html>
          )
        }
      }
      
      export default MyDocument
      `,
      filename: 'pages/_document.js',
      errors: [
        {
          message:
            'Do not include multiple instances of <Head/>. See: https://nextjs.org/docs/messages/no-duplicate-head',
          type: 'JSXElement',
        },
        {
          message:
            'Do not include multiple instances of <Head/>. See: https://nextjs.org/docs/messages/no-duplicate-head',
          type: 'JSXElement',
        },
      ],
    },
    {
      code: `
      import Document, { Html, Main, NextScript } from 'next/document'
      import Head from 'next/head'
      
      class MyDocument extends Document {
        render() {
          return (
            <Html>
              <Head>
                <meta charSet="utf-8" />
                <link
                  href="https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,400;0,700;1,400;1,700&display=swap"
                  rel="stylesheet"
                />
              </Head>
              <body>
                <Main />
                <NextScript />
              </body>
              <Head>
                <script
                  dangerouslySetInnerHTML={{
                    __html: '',
                  }}
                />
              </Head>
            </Html>
          )
        }
      }
      
      export default MyDocument
      `,
      filename: 'pages/_document.page.tsx',
      errors: [
        {
          message:
            'Do not include multiple instances of <Head/>. See: https://nextjs.org/docs/messages/no-duplicate-head',
          type: 'JSXElement',
        },
      ],
    },
  ],
})
