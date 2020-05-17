module.exports = {
  extends: ['../../../.eslintrc.js'],
  rules: {
    'unicorn/filename-case': 'off',
    'import/no-default-export': 'off',
    'react/react-in-jsx-scope': 'off', // React is always in scope with Blitz
    'jsx-a11y/anchor-is-valid': 'off', //Doesn't play well with Blitz/Next <Link> usage
  }
}
