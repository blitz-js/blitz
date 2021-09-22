module.exports = {
  extends: ["next"],
  rules: {
    "import/no-anonymous-default-export": "error",
    "import/no-webpack-loader-syntax": "off",
    "react/display-name": "off",
    "@next/next/no-html-link-for-pages": "off", // Until we add multi pages support
  },
  ignorePatterns: [".next/", ".blitz/"],
}
