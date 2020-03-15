const addHook = require('pirates').addHook

addHook(
  function(code) {
    const wrapCode =
      '\n;module.exports = require("@blitzjs/server/register/launch-editor").enhance(_launchEditorFn);'
    return code.replace('module.exports =', 'const _launchEditorFn =') + wrapCode
  },
  {
    exts: ['.js'],
    matcher: function(filename) {
      return filename.match(/launch-editor\/index/)
    },
    ignoreNodeModules: false,
  },
)
