// NOTE: This is here temporarily to support deep linking into this package
// TODO: Incorporate this deep linked file into our TS build

module.exports = {
  enhance: function(launchEditor) {
    return function(file, specifiedEditor, onErrorCallback) {
      // TODO: Implement the following:
      //       1. Load the compilation transform map from JSON
      //       2. Run a reverse lookup of the compiled file to the original URL
      // NOTE: Currently the following is hard coded as POC until we implement transformation rules
      const tmpReplacementPoc = file.replace(/\/\.blitz\/caches\/dev/, '')
      return launchEditor(tmpReplacementPoc, specifiedEditor, onErrorCallback)
    }
  },
}
