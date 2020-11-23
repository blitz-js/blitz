import { createServer } from "http";
import { parse } from "url";
import { createBlitzApp } from "@blitzjs/server";

const { PORT = "3000", NODE_ENV = "development" } = process.env

const dev = NODE_ENV === "development"

async function main() {
  const { requestHandler } = await createBlitzApp({ dev })

  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    const { pathname } = parsedUrl

    if (pathname === "/hello") {
      res.writeHead(200).end("worlds")
      return
    }

    requestHandler(req, res, parsedUrl)
  }).listen(PORT, () => {
    console.log(`🎉 Ready on http://localhost:${PORT} (NODE_ENV: ${NODE_ENV})`)
  })
}

main()
