import pluginTester from 'babel-plugin-tester';
import RewriteImports from './rewrite-imports';

pluginTester({
  pluginName: RewriteImports.name,
  plugin: RewriteImports,
  tests: [
    {
      code: `import { useQuery } from 'blitz';`,
      output: `import { useQuery } from '@blitzjs/core';`,
    },
    {
      code: `import { Image } from 'blitz';`,
      output: `import { Image } from 'next/image';`,
    },
    {
      code: `import {Image, Link} from 'blitz';`,
      output: `
        import { Link } from '@blitzjs/core';
        import { Image } from 'next/image';
      `,
    },
    {
      code: `import {Image as BlitzImage, Link} from 'blitz';`,
      output: `
        import { Link } from '@blitzjs/core';
        import { Image as BlitzImage } from 'next/image';
      `,
    },
    {
      code: `import {Document, Html, DocumentHead, Main, BlitzScript} from "blitz";`,
      output: `
        import { BlitzScript } from '@blitzjs/core/document';
        import { Main } from '@blitzjs/core/document';
        import { DocumentHead } from '@blitzjs/core/document';
        import { Html } from '@blitzjs/core/document';
        import { Document } from '@blitzjs/core/document';
      `,
    },
  ],
});
