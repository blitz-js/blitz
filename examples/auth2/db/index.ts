import { makeServerOnlyPrisma } from "blitz"
import { PrismaClient } from "@prisma/client"
import { exec } from "npm-run"

const ServerOnlyPrisma = makeServerOnlyPrisma(PrismaClient)

export * from "@prisma/client"
const db = new ServerOnlyPrisma()

// @ts-ignore
db.$reset = function reset() {
  return new Promise((res, rej) =>
    exec("prisma migrate reset --force --skip-generate --preview-feature", function (err, stdout) {
      if (err) {
        rej(err)
      } else {
        res(stdout)
      }
    })
  )
}

export default db
