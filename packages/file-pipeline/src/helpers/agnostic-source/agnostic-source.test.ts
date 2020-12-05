import fs from "fs"
import {resolve} from "path"
import {testStreamItems} from "../../test-utils"
import {agnosticSource} from "."

const cwd = resolve(__dirname, "fixtures")

function logItem(fileOrString: {path: string} | string) {
  if (typeof fileOrString === "string") {
    return fileOrString
  }
  return fileOrString.path
}

describe("agnosticSource", () => {
  beforeEach(() => {
    if (fs.existsSync(resolve(cwd, "three"))) {
      fs.unlinkSync(resolve(cwd, "three"))
    }
  })

  test("when watching = false", (done) => {
    const expected = [resolve(cwd, "one"), resolve(cwd, "two")]
    const {stream} = agnosticSource({ignore: [], include: ["**/*"], cwd, watch: false})
    const log: any[] = []
    stream.on("data", (data) => {
      if (data === "ready") {
        stream.end()
        expect(log).toEqual(expected)
        return done()
      }
      log.push(data.path)
    })
  })

  test("when watching = true", async () => {
    const expected = [resolve(cwd, "one"), resolve(cwd, "two"), "ready", resolve(cwd, "three")]
    const {stream, close} = agnosticSource({ignore: [], include: ["**/*"], cwd, watch: true})

    setTimeout(() => {
      // Wait
      const filename = resolve(cwd, "three")
      fs.writeFile(filename, Buffer.from("three"), () => {})
    }, 800)

    await testStreamItems(stream, expected, logItem)
    await close()
  })

  test("include a folder that doesn't exist", (done) => {
    console.log("Starting test: include a folder doesn't exist")
    const expected = [resolve(cwd, "one"), resolve(cwd, "two")]
    console.log("expected", expected)
    const {stream} = agnosticSource({
      ignore: [],
      include: ["**/*", "folder-that-doesnt-exist/"],
      cwd,
      watch: false,
    })
    console.log("started stream")
    const log: any[] = []
    stream.on("data", (data) => {
      if (data === "ready") {
        console.log("stream ready")
        stream.end()
        console.log("stream ended")
        expect(log).toEqual(expected)
        return done()
      }
      log.push(data.path)
    })
  })

  test("ignore a file", (done) => {
    const expected = [resolve(cwd, "one")]
    const {stream} = agnosticSource({ignore: ["two"], include: ["**/*"], cwd, watch: false})
    const log: any[] = []
    stream.on("data", (data) => {
      if (data === "ready") {
        stream.end()
        expect(log).toEqual(expected)
        return done()
      }
      log.push(data.path)
    })
  })
})
