module.exports = async (markdown, metaData) => {
  // Use the available data to create a custom release
  console.log(markdown)
  console.log(JSON.stringify(metaData))
  throw new Error()
  return markdown
}
