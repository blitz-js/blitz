module.exports = {
  extends: ["next"],
  rules: {
    "import/no-anonymous-default-export": "error",
    "import/no-webpack-loader-syntax": "off",
  },
  ignorePatterns: [".next/", ".blitz/"],
}
