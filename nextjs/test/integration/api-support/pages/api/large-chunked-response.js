export default (req, res) => {
  for (let i = 0; i <= 5 * 1024 * 1024; i++) {
    res.write('.')
  }
  res.end()
}
