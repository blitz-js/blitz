const {createServer} = require("http")
const {parse} = require("url")

const {PORT = "3000", NODE_ENV} = process.env

const dev = NODE_ENV !== "production"
const {createBlitzApp} = require("@blitzjs/server")

async function main() {
  const {requestHandler} = await createBlitzApp({dev})

  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const {pathname} = parsedUrl

    if (pathname === "/hello") {
      res.writeHead(200).end("world")
      return
    }

    requestHandler(req, res, parsedUrl)
  }).listen(PORT, (err) => {
    if (err) throw err
    console.log(`🎉 Ready on http://localhost:${PORT}`)
  })
}

main()
