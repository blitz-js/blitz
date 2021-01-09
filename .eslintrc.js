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
  plugins: ["@typescript-eslint", "import", "unicorn", "simple-import-sort"],
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
    // note you must disable the base rule as it can report incorrect errors
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
    // note you must disable the base rule as it can report incorrect errors
    "no-redeclare": "off",
    "@typescript-eslint/no-redeclare": ["error"],
    "simple-import-sort/imports": [
      "warn",
      {
        groups: [
          [
            // Side effect imports.
            "^\\u0000",
            // Packages.
            // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
            "^@?\\w",
            // Absolute imports and other imports such as Vue-style `@/foo`.
            // Anything that does not start with a dot.
            "^[^.]",
            // Relative imports.
            // Anything that starts with a dot.
            "^\\.",
          ],
        ],
      },
    ],
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
