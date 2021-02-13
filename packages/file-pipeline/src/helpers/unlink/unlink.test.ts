import {normalize, resolve} from "path"
import File from "vinyl"
import {take} from "../../test-utils"
import {unlink} from "."

describe("unlink", () => {
  it("should unlink the correct path", async () => {
    const unlinkFile = jest.fn(() => Promise.resolve())

    const unlinkStream = unlink(normalize("/dest"), unlinkFile)

    unlinkStream.write(
      new File({
        cwd: normalize("/src"),
        path: normalize("/src/bar/baz.tz"),
        content: null,
        event: "unlink",
      }),
    )

    await take(unlinkStream, 1)

    // Remove the correct file
    expect(unlinkFile).toHaveBeenCalledWith(resolve(normalize("/dest/bar/baz.tz")), {glob: false})
  })
})
