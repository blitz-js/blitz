module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: `./tsconfig.json`,
  },
  plugins: ["@typescript-eslint", "import", "unicorn"],
  extends: ["react-app"],
  rules: {
    "react/react-in-jsx-scope": "off", // React is always in scope with Blitz
    "jsx-a11y/anchor-is-valid": "off", //Doesn't play well with Blitz/Next <Link> usage
    "import/first": "off",
    "import/no-default-export": "error",
    "require-await": "error",
    "no-async-promise-executor": "error",
    "unicorn/filename-case": [
      "error",
      {
        case: "kebabCase",
      },
    ],
    "@typescript-eslint/no-floating-promises": "error",
  },
  ignorePatterns: ["packages/cli/", "packages/generator/templates", ".eslintrc.js"],
  overrides: [
    {
      files: ["examples/**", "packages/gui/**", "recipes/**"],
      rules: {
        "import/no-default-export": "off",
        "unicorn/filename-case": "off",
        "@typescript-eslint/no-floating-promises": "off",
      },
    },
  ],
}
