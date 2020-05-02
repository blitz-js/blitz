module.exports = {
  extends: ['react-app', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
  rules: {
    'import/first': 0,
    'import/no-default-export': ['error'],
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
      },
    ],
  },
  plugins: ['unicorn'],
}
