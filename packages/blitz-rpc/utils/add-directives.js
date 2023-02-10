const fs = require("fs")

const filesToModify = [
  "dist/chunks/utils.cjs",
  "dist/chunks/utils.mjs",
  "dist/index.cjs",
  "dist/index.mjs",
]

const addDirectives = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf8")
  const newFileContent = "'use client';\n" + fileContent
  fs.writeFileSync(filePath, newFileContent)
}

const fixNextRouter = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf8")
  const newFileContent = fileContent.replace("require('next/router');", "")
  const newFileContent2 = newFileContent.replace(
    "require('@tanstack/react-query');",
    "require('./index.cjs');",
  )
  fs.writeFileSync(filePath, newFileContent2)
}

filesToModify.forEach(addDirectives)
fixNextRouter("dist/index-server.cjs")
