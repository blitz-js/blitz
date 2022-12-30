// tailwind.config.js
const {paths} = require("blitz/installer")

module.exports = {
  content: [`${paths.appSrcDirectory({isConfig: true})}/**/*.{js,ts,jsx,tsx}`],
  theme: {
    extend: {},
  },
  plugins: [],
}
