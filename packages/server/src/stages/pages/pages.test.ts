import {normalize} from "path"
import File from "vinyl"
import {mockStageArgs} from "../stage-test-utils"
import {createStagePages} from "."
import {DuplicatePathError} from "./errors"

function getStreamWithInputCache(entries: string[]) {
  return createStagePages(mockStageArgs({entries})).stream
}

describe("createStagePages", () => {
  it("should throw an error when there are duplicates", (done) => {
    const stream = getStreamWithInputCache([
      normalize("app/api/foo.ts"),
      normalize("app/api/foo.ts"),
    ])
    stream.on("error", (err) => {
      expect(err.message).toContain("conflicting api routes:")
      done()
    })

    // The check happens while files are being consumed so we need to pass a file
    stream.write(new File({path: "foo", content: "bar"}))
  })

  it("should throw an error when there are duplicate pages", (done) => {
    const stream = getStreamWithInputCache(
      ["app/foo/pages/bar.ts", "app/pages/bar.ts", "pages/bar.ts"].map(normalize),
    )
    stream.on("error", (err) => {
      expect(err.message).toContain("conflicting page routes:")
      expect(err.paths).toEqual([
        ["app/foo/pages/bar.ts", "app/pages/bar.ts", "pages/bar.ts"].map(normalize),
      ])
      done()
    })

    // The check happens while files are being consumed so we need to pass a file
    stream.write(new File({path: "foo", content: "bar"}))
  })

  it("should throw an error when there are duplicate api routes from both in pages and out", (done) => {
    const stream = getStreamWithInputCache(
      ["app/pages/api/bar.ts", "app/api/bar.ts"].map(normalize),
    )
    stream.on("error", (err: DuplicatePathError) => {
      expect(err.message).toContain("conflicting api routes:")
      expect(err.paths).toEqual([["app/pages/api/bar.ts", "app/api/bar.ts"].map(normalize)])
      done()
    })

    // The check happens while files are being consumed so we need to pass a file
    stream.write(new File({path: "foo", content: "bar"}))
  })

  it("should not throw an error when there are nested api routes", (done) => {
    const stream = getStreamWithInputCache(
      ["app/pages/foo/api/bar.ts", "app/api/bar.ts"].map(normalize),
    )
    stream.on("error", () => {
      expect(true).toBe("This should not have been called")
      done()
    })

    // The check happens while files are being consumed so we need to pass a file
    stream.write(new File({path: "foo", content: "bar"}))
    setImmediate(done)
  })
})
