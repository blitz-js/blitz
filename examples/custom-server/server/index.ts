import { createServer } from "http";
import { parse } from "url";
import { createBlitzApp } from "@blitzjs/server";
import { log } from "@blitzjs/display"

const { PORT = "3000", NODE_ENV = "development" } = process.env

const dev = NODE_ENV === "development"

async function main() {
  const { requestHandler } = await createBlitzApp({ dev })

  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    const { pathname } = parsedUrl

    if (pathname === "/hello") {
      res.writeHead(200).end("world")
      return
    }

    requestHandler(req, res, parsedUrl)
  }).listen(PORT, () => {
    log.success(`Ready on http://localhost:${PORT}`)
  })
}

main()
