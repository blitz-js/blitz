module.exports = {
  presets: [
    "@babel/preset-typescript",
    "@babel/preset-react",
    [
      "@babel/preset-env",
      {
        modules: false,
        loose: true,
        exclude: [
          "@babel/plugin-transform-async-to-generator",
          "@babel/plugin-transform-regenerator",
        ],
      },
    ],
  ],
  plugins: [
    "babel-plugin-annotate-pure-calls",
    "babel-plugin-dev-expression",
    ["@babel/plugin-proposal-class-properties", {loose: true}],
    "babel-plugin-macros",
    [
      "transform-inline-environment-variables",
      {
        include: ["BLITZ_PROD_BUILD"],
      },
    ],
  ],
  overrides: [
    {
      test: "./test/**/*",
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            exclude: [
              "@babel/plugin-transform-async-to-generator",
              "@babel/plugin-transform-regenerator",
            ],
          },
        ],
        "blitz/babel",
      ],
      plugins: [],
    },
    {
      test: "./nextjs/test/**/*",
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            exclude: [
              "@babel/plugin-transform-async-to-generator",
              "@babel/plugin-transform-regenerator",
            ],
          },
        ],
        "blitz/babel",
      ],
    },
  ],
}
