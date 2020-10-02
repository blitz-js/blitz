import through2 from "through2"
import {testStreamItems} from "../test-utils"
import File from "vinyl"
import {transformFiles} from "."
import {normalize} from "path"
function logFile(file: File | string) {
  if (typeof file === "string") {
    return file
  }

  return file.path
}
describe("transformFiles", () => {
  test("Files and events are sent from one end of the pipeline to the other", async () => {
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

    source.stream.write(
      new File({
        path: normalize("/foo/one"),
        content: Buffer.from("one"),
      }),
    )

    source.stream.write(
      new File({
        path: normalize("/foo/two"),
        content: Buffer.from("two"),
      }),
    )
    source.stream.write(
      new File({
        path: normalize("/foo/three"),
        content: Buffer.from("three"),
      }),
    )

    source.stream.write("ready")

    // Close the test when these are both done
    await Promise.all([
      testStreamItems(
        writer.stream,
        ["/foo/one", "/foo/two", "/foo/three"].map(normalize).concat(["ready"]),
        logFile,
      ),
      transformFiles(normalize("/foo"), [], normalize("/bar"), {source, writer}),
    ])
  })
})
