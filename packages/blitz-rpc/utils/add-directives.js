const fs = require("fs")

const filesToModify = [
  "dist/index.cjs",
  "dist/index.mjs",
  "dist/chunks/react-query-utils.cjs",
  "dist/chunks/react-query-utils.mjs",
]

const addDirectives = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf8")
  const newFileContent = "'use client';\n" + fileContent
  fs.writeFileSync(filePath, newFileContent)
}

filesToModify.forEach(addDirectives)
