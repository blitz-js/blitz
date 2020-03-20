// NOTE: This is here to support deep linking into this package
//       It would be nice to be able to write this code in typescript
// TODO: Incorporate this deep linked file into our TS build
const ManifestLoader = require('@blitzjs/server').ManifestLoader
const resolve = require('path').resolve

module.exports = {
  enhance: function(launchEditor) {
    return function(file, specifiedEditor, onErrorCallback) {
      // This location needs to be driven from the config instead of cwd()
      const manifestLocation = resolve(process.cwd(), '_manifest.json')

      ManifestLoader.load(manifestLocation)
        .then(manifest => {
          // extract filename
          const [filename, row, col] = file.split(':')

          const originalPath = manifest.getByValue(filename)

          if (!originalPath) {
            throw new Error('Manifest did not yeild original path from ' + filename)
          }

          // Use sourcemaps eventually
          const editorAddress = [originalPath, row, col].join(':')

          return launchEditor(editorAddress, specifiedEditor, onErrorCallback)
        })
        .catch(err => {
          console.error(err)
        })
    }
  },
}
