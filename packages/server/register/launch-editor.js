// NOTE: This is here to support deep linking into this package
//       It would be nice to be able to write this code in typescript
// TODO: Incorporate this deep linked file into our TS build

module.exports = {
  enhance: function(launchEditor) {
    return function(file, specifiedEditor, onErrorCallback) {
      // TODO: Implement the following:
      //       1. Load the compilation transform map from JSON
      //       2. Run a reverse lookup of the compiled file to the original URL
      // HACK: Currently the following is hard coded as POC until we have a build manifest to lookup
      const tmpReplacementPoc = file.replace(/\/\.blitz\/caches\/dev/, '')
      return launchEditor(tmpReplacementPoc, specifiedEditor, onErrorCallback)
    }
  },
}
