import {assert, expect, test} from "vitest"

test("JSON", () => {
  const input = {
    foo: "hello",
    bar: "world",
  }

  const output = JSON.stringify(input)

  expect(output).eq('{"foo":"hello","bar":"world"}')
  assert.deepEqual(JSON.parse(output), input, "matches original")
})
