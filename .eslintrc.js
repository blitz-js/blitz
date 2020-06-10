module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'import', 'unicorn'],
  extends: ['react-app'],
  rules: {
    'react/react-in-jsx-scope': 'off', // React is always in scope with Blitz
    'jsx-a11y/anchor-is-valid': 'off', //Doesn't play well with Blitz/Next <Link> usage
    'import/first': 0,
    'import/no-default-export': ['error'],
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
      },
    ],
  },
  ignorePatterns: ['packages/cli/', 'packages/generator/templates'],
  overrides: [
    {
      files: ['examples/**', 'packages/gui/**'],
      rules: {
        'import/no-default-export': 'off',
        'unicorn/filename-case': 'off',
      },
    },
  ],
}
