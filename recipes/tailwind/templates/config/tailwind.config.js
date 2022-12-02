// tailwind.config.js
const fs = require("fs")
const path = require("path")

const appDirectory = fs.existsSync(path.resolve("src/pages")) ? "src" : "{pages,app}"

module.exports = {
  content: [`${appDirectory}/**/*.{js,ts,jsx,tsx}`],
  theme: {
    extend: {},
  },
  plugins: [],
}
