const excluded = [
  /[\\/]npm-which[\\/]/,
  /[\\/]cross-spawn[\\/]/,
  /@blitzjs[\\/]config/,
  /blitz[\\/]packages[\\/]config/,
  /blitz2[\\/]packages[\\/]config/,
]
module.exports = {
  stories: ["../app/stories/**/*.stories.mdx", "../app/stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  webpackFinal: async (config, {configType}) => {
    config.module.rules.push({
      issuer: /(mutations|queries)(?!.*\.client)/,
      resource: /_resolvers/,
      use: {loader: "null-loader"},
    })

    excluded.forEach((excluded) => {
      config.module.rules.push({test: excluded, use: {loader: "null-loader"}})
    })

    return config
  },
  framework: "@storybook/react",
}
