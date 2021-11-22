import pluginTester from 'babel-plugin-tester'
import RewriteImports from 'next/dist/build/babel/plugins/rewrite-imports'

pluginTester({
  pluginName: RewriteImports.name,
  plugin: RewriteImports,
  tests: [
    {
      code: `import { useQuery } from 'blitz'`,
      output: `import { useQuery } from 'next/data-client'`,
    },
    {
      code: `import { Image } from 'blitz'`,
      output: `import { Image } from 'next/image'`,
    },
    {
      code: `import {Image, Link} from 'blitz'`,
      output: `
        import { Link } from 'next/link'
        import { Image } from 'next/image'
      `,
    },
    {
      code: `import {Image as BlitzImage, Link} from 'blitz'`,
      output: `
        import { Link } from 'next/link'
        import { Image as BlitzImage } from 'next/image'
      `,
    },
    {
      code: `import {Document, Html, DocumentHead, Main, BlitzScript} from "blitz"`,
      output: `
        import { BlitzScript } from 'next/document'
        import { Main } from 'next/document'
        import { DocumentHead } from 'next/document'
        import { Html } from 'next/document'
        import { Document } from 'next/document'
      `,
    },
  ],
})
