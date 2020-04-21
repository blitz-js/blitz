module.exports = {
  extends: ['react-app', 'plugin:jsx-a11y/recommended'],
  plugins: ['jsx-a11y'],
  rules: {
    'import/no-webpack-loader-syntax': 'off',
    'react/react-in-jsx-scope': 'off', // React is always in scope with Blitz
  },
}
