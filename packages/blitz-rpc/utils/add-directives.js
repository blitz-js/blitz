const fs = require("fs")

const filesToModify = [
  "dist\\index-browser.cjs",
  "dist\\index-browser.mjs",
  "dist\\index-server.cjs",
  "dist\\index-server.mjs",
  "dist\\chunks\\rpc.cjs",
  "dist\\chunks\\rpc.mjs",
]

const addDirectives = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf8")
  const newFileContent = '"use client";\n' + fileContent
  fs.writeFileSync(filePath, newFileContent)
}

filesToModify.forEach(addDirectives)
