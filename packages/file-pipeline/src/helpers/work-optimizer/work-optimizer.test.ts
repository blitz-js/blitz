import {createWorkOptimizer} from "."
import {take} from "../../test-utils"
import {pipeline} from "../../streams"
import {normalize} from "path"
import File from "vinyl"

describe("agnosticSource", () => {
  test("basic throughput", async () => {
    const saveCache = jest.fn()
    const readCache = jest.fn()
    const {triage, reportComplete} = createWorkOptimizer("/src", "/dest", saveCache, readCache)

    triage.write(
      new File({
        hash: "one",
        path: normalize("/path/to/one"),
        content: Buffer.from("one"),
        event: "add",
      }),
    )

    triage.write(
      new File({
        hash: "two",
        path: normalize("/path/to/two"),
        content: Buffer.from("two"),
        event: "add",
      }),
    )

    triage.write(
      new File({
        hash: "three",
        path: normalize("/path/to/three"),
        content: Buffer.from("three"),
        event: "add",
      }),
    )

    const expected = ["/path/to/one", "/path/to/two", "/path/to/three"].map(normalize)
    const stream = pipeline(triage, reportComplete)
    const items = await take<File>(stream, 3)
    expect(items.map(({path}) => path)).toEqual(expected)
  })

  test("same file is rejected", async () => {
    const saveCache = jest.fn()
    const readCache = jest.fn()
    const {triage, reportComplete} = createWorkOptimizer("/src", "/dest", saveCache, readCache)
    triage.write(
      new File({
        hash: "one",
        path: normalize("/path/to/one"),
        content: Buffer.from("one"),
        event: "add",
      }),
    )

    triage.write(
      new File({
        hash: "one",
        path: normalize("/path/to/one"),
        content: Buffer.from("one"),
        event: "add",
      }),
    )

    triage.write(
      new File({
        hash: "two",
        path: normalize("/path/to/two"),
        content: Buffer.from("two"),
        event: "add",
      }),
    )

    const expected = ["/path/to/one", "/path/to/two"].map(normalize)
    const stream = pipeline(triage, reportComplete)
    const items = await take<File>(stream, 2)
    expect(items.map(({path}) => path)).toEqual(expected)
  })

  test("read cache from disk and skips cached files with the same hash and path", async () => {
    const saveCache = jest.fn()
    const readCache = jest.fn(() => {
      return '{"to/one": "one","to/two": "two"}'
    })
    const {triage, reportComplete} = createWorkOptimizer("/path", "/dest", saveCache, readCache)
    triage.write(
      new File({
        hash: "one",
        path: normalize("/path/to/one"),
        content: Buffer.from("one"),
        event: "add",
      }),
    )
    triage.write(
      new File({
        hash: "two",
        path: normalize("/path/to/two"),
        content: Buffer.from("two"),
        event: "add",
      }),
    )
    triage.write(
      new File({
        hash: "three",
        path: normalize("/path/to/three"),
        content: Buffer.from("three"),
        event: "add",
      }),
    )

    const stream = pipeline(triage, reportComplete)
    const [item] = await take<File>(stream, 1)
    expect(item.path).toEqual(normalize("/path/to/three"))
  })

  test("save cache should be saved correctly", async () => {
    const saveCache = jest.fn()
    const readCache = jest.fn()
    const {triage, reportComplete} = createWorkOptimizer("/path", "/dest", saveCache, readCache)
    triage.write(
      new File({
        hash: "one",
        path: normalize("/path/to/one"),
        content: Buffer.from("one"),
        event: "add",
      }),
    )
    triage.write(
      new File({
        hash: "two",
        path: normalize("/path/to/two"),
        content: Buffer.from("two"),
        event: "add",
      }),
    )
    triage.write(
      new File({
        hash: "three",
        path: normalize("/path/to/three"),
        content: Buffer.from("three"),
        event: "add",
      }),
    )

    const stream = pipeline(triage, reportComplete)
    await take(stream, 3)

    const doneObj = {
      "to/one": "one",
      "to/two": "two",
      "to/three": "three",
    }

    expect(saveCache).toHaveBeenCalledWith("/dest/_blitz_done.json", doneObj)
  })

  test("should keep track of deleted files", async () => {
    const saveCache = jest.fn()
    const readCache = jest.fn()
    const {triage, reportComplete} = createWorkOptimizer("/path", "/dest", saveCache, readCache)
    triage.write(
      new File({
        hash: "one",
        path: normalize("/path/to/one"),
        content: Buffer.from("one"),
        event: "add",
      }),
    )
    triage.write(
      new File({
        hash: "two",
        path: normalize("/path/to/two"),
        content: Buffer.from("two"),
        event: "add",
      }),
    )
    triage.write(
      new File({
        hash: "three",
        path: normalize("/path/to/three"),
        content: Buffer.from("three"),
        event: "add",
      }),
    )
    triage.write(
      new File({
        hash: "something else",
        path: normalize("/path/to/two"),
        event: "unlink",
      }),
    )

    const stream = pipeline(triage, reportComplete)
    await take(stream, 4)

    const expectedDone = {
      "to/one": "one",
      "to/three": "three",
    }

    expect(saveCache).toHaveBeenCalledWith("/dest/_blitz_done.json", expectedDone)
  })
})
