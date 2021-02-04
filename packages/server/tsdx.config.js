module.exports = {
  rollup(config, options) {
    config.onwarn = (warning, warn) => {
      if (warning.code === "EVAL" && /[/\\](supertokens.ts)$/.test(warning.loc.file)) {
        return
      }
      warn(warning)
    }
    return config
  },
}
