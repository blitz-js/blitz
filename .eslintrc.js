module.exports = {
  extends: ['react-app', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
  rules: {
    'import/first': 0,
    'import/no-default-export': ['warn'],
    'unicorn/filename-case': [
      'warn',
      {
        case: 'kebabCase',
      },
    ],
  },
  plugins: ['unicorn'],
}
