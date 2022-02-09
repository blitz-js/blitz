module.exports = {
  extends: ["next", "prettier"],
  ignorePatterns: ["*.d.ts"],
  settings: {
    next: {
      rootDir: ["./apps/*/", "./packages/*/"],
    },
  },
  rules: {
    "@next/next/no-html-link-for-pages": "off",
  },
  overrides: [
    {
      files: ["**/*.ts?(x)"],
      plugins: ["@typescript-eslint"],
      parserOptions: {
        project: "./tsconfig.json",
      },
      rules: {
        "@typescript-eslint/no-floating-promises": "error",
        "no-use-before-define": "off",
        "@typescript-eslint/no-use-before-define": ["warn"],
        "no-redeclare": "off",
        "@typescript-eslint/no-redeclare": ["error"],
      },
    },
  ],
}
