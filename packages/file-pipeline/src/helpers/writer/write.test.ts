import {normalize} from "path"
import File from "vinyl"
import {FILE_DELETED, FILE_WRITTEN} from "../../events"
import {through} from "../../streams"
import {testStreamItems} from "../../test-utils"
import {createWrite} from "."

describe("writer", () => {
  it("should write files", async () => {
    // Setup an input stream

    const bus = through.obj()
    const destinationWriter = through({objectMode: true}, (f, _, next) => {
      if (typeof f === "string")
        throw new Error("This should not happen because the writer wont allow it!")
      next(null, f)
    })

    // setup the test pipeline
    const writer = createWrite(normalize("/foo"), bus, destinationWriter).stream
    writer.write(new File({path: normalize("/bar"), event: "unlink"}))
    writer.write(new File({path: normalize("/thing"), event: "add"}))
    writer.write("foo")

    await testStreamItems(
      bus,
      [
        // Note order is not necessarily deterministic
        // If that is the case we can change the way we test this
        {type: FILE_WRITTEN, file: normalize("/thing")},
        {type: FILE_DELETED, file: normalize("/bar")},
      ],
      ({type, payload}) => ({type, file: payload.path}),
    )
  })
})
