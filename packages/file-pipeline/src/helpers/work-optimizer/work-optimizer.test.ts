import {createWorkOptimizer} from "."
import {testStreamItems} from "../../test-utils"
import {pipeline} from "../../streams"
import {normalize} from "path"
import File from "vinyl"

function logItem(fileOrString: {path: string} | string) {
  if (typeof fileOrString === "string") {
    return fileOrString
  }
  return fileOrString.path
}

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
      }),
    )

    triage.write(
      new File({
        hash: "two",
        path: normalize("/path/to/two"),
        content: Buffer.from("two"),
      }),
    )

    triage.write(
      new File({
        hash: "three",
        path: normalize("/path/to/three"),
        content: Buffer.from("three"),
      }),
    )

    const expected = ["/path/to/one", "/path/to/two", "/path/to/three"].map(normalize)
    const stream = pipeline(triage, reportComplete)
    await testStreamItems(stream, expected, logItem)
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
      }),
    )

    triage.write(
      new File({
        hash: "one",
        path: normalize("/path/to/one"),
        content: Buffer.from("one"),
      }),
    )

    triage.write(
      new File({
        hash: "two",
        path: normalize("/path/to/two"),
        content: Buffer.from("two"),
      }),
    )

    const expected = ["/path/to/one", "/path/to/two"].map(normalize)
    const stream = pipeline(triage, reportComplete)
    await testStreamItems(stream, expected, logItem)
  })

  test("read cache from disk and skips cached files with the same hash", async () => {
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
      }),
    )
    triage.write(
      new File({
        hash: "two",
        path: normalize("/path/to/two"),
        content: Buffer.from("two"),
      }),
    )
    triage.write(
      new File({
        hash: "three",
        path: normalize("/path/to/three"),
        content: Buffer.from("three"),
      }),
    )

    const expected = ["/path/to/three"].map(normalize)
    const stream = pipeline(triage, reportComplete)
    await testStreamItems(stream, expected, logItem)
  })
})
