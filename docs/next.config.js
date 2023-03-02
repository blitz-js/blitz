const remarkShikiTwoslash = require('remark-shiki-twoslash')

const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  // Not working yet
  remarkPlugins: [
    [
      remarkShikiTwoslash
    ]
  ]
})

module.exports = withNextra()
