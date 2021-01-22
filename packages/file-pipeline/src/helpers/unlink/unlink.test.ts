import {normalize, resolve} from "path"
import File from "vinyl"
import {take} from "../../test-utils"
import {unlink} from "."

describe("unlink", () => {
  it("should unlink the correct path", async () => {
    const unlinkFile = jest.fn(() => Promise.resolve())
    const pathExists = jest.fn(() => Promise.resolve(true))

    const unlinkStream = unlink(normalize("/dest"), unlinkFile, pathExists)

    unlinkStream.write(
      new File({
        cwd: normalize("/src"),
        path: normalize("/src/bar/baz.tz"),
        content: null,
        event: "unlink",
      }),
    )

    await take(unlinkStream, 1)

    // Test the file exists before attempting to unlink it
    expect(pathExists).toHaveBeenCalledWith(resolve(normalize("/dest/bar/baz.tz")))

    // Remove the correct file
    expect(unlinkFile).toHaveBeenCalledWith(resolve(normalize("/dest/bar/baz.tz")))
  })
})
