module.exports = {
  extends: [
    'react-app',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:node/recommended-module',
  ],
  rules: {
    'import/first': 0,
    'import/no-default-export': ['error'],
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
      },
    ],
    'node/no-extraneous-import': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-unsupported-features/node-builtins': 'error',
    'no-process-exit': 'off',
  },
  plugins: ['unicorn'],
  settings: {
    node: {
      tryExtensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
  },
}
