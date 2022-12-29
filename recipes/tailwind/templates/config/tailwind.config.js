// tailwind.config.js
const {paths} = require("blitz/installer")

module.exports = {
  content: [`${paths.appSrcDirectory({config: true})}/**/*.{js,ts,jsx,tsx}`],
  theme: {
    extend: {},
  },
  plugins: [],
}
