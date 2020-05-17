# @blitzjs/meta

React component for generating Open Graph/etc meta tags for Blitz pages and sites.
Designed for Next.js but framework-agnostic.

## Usage

```bash
yarn add @blitzjs/meta
# npm i @blitzjs/meta
```

Example for a documentation site:

```js
// import Head from 'next/head'

<Meta
  as={Head} // component to wrap tags in, defaults to React.Fragment
  name="Blitz" // site name
  title="Docs" // page title
  description="The official Blitz documentation" // page description
  image="https://.../card.png" // large summary image URL
  color="#6700eb" // theme color
  manifest="/site.webmanifest" // link to site manifest
/>
```

All props are optional. If included multiple times, the tags from the last
instance will be used.

## Prior art:

- https://realfavicongenerator.net/
- https://joshwcomeau.com/snippets/html/html-skeleton
- https://github.com/garmeeh/next-seo

MIT License
