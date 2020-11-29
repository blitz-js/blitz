import {normalize} from "path"
import through2 from "through2"
import File from "vinyl"
import {testStreamItems} from "../test-utils"
import {transformFiles} from "."

function logFile(file: File | string) {
  const out = typeof file === "string" ? file : file.path
  return out
}

function generateFile(num: number) {
  // const num = Math.random()
  return new File({
    path: normalize(`/foo/${num}.ts`),
    content: Buffer.from(`${num}`),
  })
}

describe("transformFiles", () => {
  it("should ignore gitignored files", async () => {
    process.env.MAX_DEBUG_PLS = "true"
    const source = {
      stream: through2.obj((f, _, next) => {
        next(null, f)
      }),
    }

    const writer = {
      stream: through2.obj((f, _, next) => {
        next(null, f)
      }),
    }

    const files: File[] = []
    for (let i = 0; i < 10; i++) {
      files.push(generateFile(i))
    }

    files.forEach((f) => {
      source.stream.write(f)
    })

    source.stream.write(
      new File({
        path: normalize(`/foo/.DS_Store`),
        content: Buffer.from(`test`),
      }),
    )
    source.stream.write(
      new File({
        path: normalize(`/foo/logs/stdout.log`),
        content: Buffer.from(`test`),
      }),
    )
    source.stream.write(
      new File({
        path: normalize(`/foo/.blitz/test.txt`),
        content: Buffer.from(`test`),
      }),
    )

    source.stream.write("ready")

    await Promise.all([
      testStreamItems(
        writer.stream,
        files
          .map((f) => {
            return normalize(f.path)
          })
          .concat(["ready"]),
        logFile,
      ),
      transformFiles(normalize("/foo"), [], normalize("/bar"), {
        source,
        writer,
        ignore: ["**/.DS_Store", "**/*.log", "**/.blitz/**/*"],
      }),
    ])
  })
})
