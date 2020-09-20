module.exports = {
  extends: ["../../.eslintrc.js"],
  plugins: ["es5"],
  rules: {
    "es5/no-for-of": "error",
    "es5/no-generators": "error",
    "es5/no-typeof-symbol": "error",
    "es5/no-es6-methods": "error",
    "es5/no-es6-static-methods": [
      "error",
      {
        exceptMethods: ["Object.assign"],
      },
    ],
  },
}
