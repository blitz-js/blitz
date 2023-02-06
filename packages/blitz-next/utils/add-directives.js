const fs = require("fs")

const filesToModify = [
  "dist\\index-browser.cjs",
  "dist\\index-browser.mjs",
  "dist\\chunks\\index-browser.cjs",
  "dist\\chunks\\index-browser.mjs",
]

const addDirectives = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf8")
  const newFileContent = "'use client';\n" + fileContent
  fs.writeFileSync(filePath, newFileContent)
}

const serverFiles = ["dist\\index-server.cjs", "dist\\index-server.mjs"]

const fixNextRouter = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf8")
  const newFileContent = fileContent.replace("require('next/router');", "")
  const newFileContent2 = newFileContent.replace("require('@tanstack/react-query');", "")
  fs.writeFileSync(filePath, newFileContent2)
}

filesToModify.forEach(addDirectives)
serverFiles.forEach(fixNextRouter)
