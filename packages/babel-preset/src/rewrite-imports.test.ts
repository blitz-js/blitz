import pluginTester from 'babel-plugin-tester';
import RewriteImports from './rewrite-imports';

pluginTester({
  pluginName: RewriteImports.name,
  plugin: RewriteImports,
  tests: [
    {
      code: `import { resolver } from 'blitz';`,
      output: `import { resolver } from '@blitzjs/core';`,
    },
    {
      code: `import { Image } from 'blitz';`,
      output: `import { Image } from '@blitzjs/core/image';`,
    },
    {
      code: `import {Image, Link} from 'blitz';`,
      output: `
        import { Link } from '@blitzjs/core';
        import { Image } from '@blitzjs/core/image';
      `,
    },
    {
      code: `import {Image as BlitzImage, Link} from 'blitz';`,
      output: `
        import { Link } from '@blitzjs/core';
        import { Image as BlitzImage } from '@blitzjs/core/image';
      `,
    },
  ],
});
