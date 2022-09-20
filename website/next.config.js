const fs = require("fs")
const matter = require("gray-matter")
const minimatch = require("minimatch")
const path = require("path")
const querystring = require("querystring")
const {createLoader} = require("simple-functional-loader")


// import withBlitzLinks from "./remark/withBlitzLinks.js"
// import withProse from "./remark/withProse.js"
// import withSyntaxHighlighting from "./remark/withSyntaxHighlighting.js"
// import withTableOfContents from "./remark/withTableOfContents.js"

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})
const { withBlitz } = require("@blitzjs/next")
/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
const fallbackDefaultExports = {
  "app/pages/docs/**/*": ["@/layouts/DocumentationLayout", "DocumentationLayout"],
}


const config = withBlitz(withBundleAnalyzer({
  pageExtensions: ["js", "jsx", "mdx"],
  images: {
    domains: [
      "raw.githubusercontent.com",
      "avatars.githubusercontent.com",
      "avatars0.githubusercontent.com",
      "avatars1.githubusercontent.com",
      "avatars2.githubusercontent.com",
      "avatars3.githubusercontent.com",
      "avatars4.githubusercontent.com",
      "avatars5.githubusercontent.com",
      "avatars6.githubusercontent.com",
      "media-exp1.licdn.com",
    ],
  },
  async redirects() {
    return [
      {
        source: "/docs/getting-started",
        destination: "/docs/get-started",
        permanent: false,
      },
      {
        source: "/joinmeetup",
        destination: "https://us02web.zoom.us/j/85901497017?pwd=eVo4YlhsU2E3UHQvUmgxTmtRUDBIZz09",
        permanent: false,
      },
      {
        source: "/fame",
        destination: "https://twitter.com/flybayer/status/1361334647859384320",
        permanent: false,
      },
      {
        source: "/discord",
        destination: "http://discord.gg/blitzjs",
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/stickers",
        destination: "/docs/stickers",
      },
    ]
  },
  webpack(config, options) {
    if (!options.dev) {
      options.defaultLoaders.babel.options.cache = false
    }

    config.module.rules.push({
      test: /\.(png|jpe?g|gif|webp)$/i,
      use: [
        {
          loader: "file-loader",
          options: {
            publicPath: "/_next",
            name: "static/media/[name].[hash].[ext]",
          },
        },
      ],
    })

    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {loader: "@svgr/webpack", options: {svgoConfig: {plugins: {removeViewBox: false}}}},
        {
          loader: "file-loader",
          options: {
            publicPath: "/_next",
            name: "static/media/[name].[hash].[ext]",
          },
        },
      ],
    })

    config.module.rules.push({
      test: /\.mdx$/,
      use: [
        options.defaultLoaders.babel,
        createLoader(function (source) {
          if (source.includes("/*START_META*/")) {
            const [meta] = source.match(/\/\*START_META\*\/(.*?)\/\*END_META\*\//s)
            return "export default " + meta
          }
          return (
            source.replace(/^export const/gm, "const") + `\nMDXContent.layoutProps = layoutProps\n`
          )
        }),
        {
          loader: "@mdx-js/loader",
          options: {
            // remarkPlugins: [withProse, withTableOfContents, withSyntaxHighlighting, withBlitzLinks],
          },
        },
        createLoader(function (source) {
          let {meta: fields} = querystring.parse(this.resourceQuery.substr(1))
          let {data: meta, content: body} = matter(source)
          if (fields) {
            for (let field in meta) {
              if (!fields.split(",").includes(field)) {
                delete meta[field]
              }
            }
          }

          let extra = []
          let resourcePath = path.relative(process.cwd(), this.resourcePath)

          // If no custom layout, use the default layout
          if (!/^\s*export\s+default\s+/m.test(source.replace(/```(.*?)```/gs, ""))) {
            for (let glob in fallbackDefaultExports) {
              if (minimatch(resourcePath, glob)) {
                extra.push(
                  `import { ${fallbackDefaultExports[glob][1]} as _Default } from '${fallbackDefaultExports[glob][0]}'`,
                  "export default _Default",
                )
                break
              }
            }
          }

          // If there are any cards, impory the component
          if (/^<\/Card>$/m.test(body)) {
            extra.push(`import { Card } from '@/components/docs/Card'`)

            // Until MDX v2 is available, all content inside a component must
            // have extra spaces. Here are added just in case.
            // https://mdxjs.com/guides/markdown-in-components
            body = body
              .replace(/<Card .+?>\n*/g, (tag) => tag.trimEnd() + "\n\n")
              .replace(/\n*<\/Card>/g, (tag) => "\n\n" + tag.trimStart())
          }

          return [
            ...(typeof fields === "undefined" ? extra : []),
            typeof fields === "undefined" ? body : "",
            typeof fields === "undefined"
              ? `export const meta = ${JSON.stringify(meta)}`
              : `export const meta = /*START_META*/${JSON.stringify(meta || {})}/*END_META*/`,
          ].join("\n\n")
        }),
      ],
    })

    config.module.rules.push({
      test: /navs[/\\]documentation\.json$/, // accept both navs/documentation.json and navs\documentation.json
      use: [
        createLoader(function (source) {
          const documentation = JSON.parse(source)
          let finalDocumentation = []

          for (const category of documentation) {
            let pages = []
            for (const page of category.pages) {
              const pageFile = fs.readFileSync(
                path.resolve(process.cwd(), "app", "pages", "docs", `${page}.mdx`),
                {encoding: "utf-8"},
              )
              const {data} = matter(pageFile)

              pages.push({
                ...data,
                href: `/docs/${page}`,
              })
            }
            finalDocumentation.push({
              ...category,
              pages,
            })
          }

          return JSON.stringify(finalDocumentation)
        }),
      ],
    })

    return config
  },
}))

module.exports = config


