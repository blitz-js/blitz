import {fullTransformer, findDuplicates, filterBy} from "."
import {normalize} from "path"

test("should filter by path", () => {
  expect(fullTransformer(normalize("app/foo/pages/api/bar.ts"))).toBe(normalize("pages/api/bar.ts"))
  expect(fullTransformer(normalize("app/foo/api/bar.ts"))).toBe(normalize("pages/api/bar.ts"))

  const dupes = findDuplicates(
    [
      "app/foo/pages/api/bar.ts",
      "app/pages/api/bar.ts",
      "app/api/bar.ts",
      "pages/bar.ts",
      "app/ding/pages/bar.ts",
    ].map(normalize),
    fullTransformer,
  )

  expect(dupes).toEqual([
    ["app/foo/pages/api/bar.ts", "app/pages/api/bar.ts", "app/api/bar.ts"].map(normalize),
    ["pages/bar.ts", "app/ding/pages/bar.ts"].map(normalize),
  ])
  expect(filterBy(dupes, "api")).toEqual([
    ["app/foo/pages/api/bar.ts", "app/pages/api/bar.ts", "app/api/bar.ts"].map(normalize),
  ])
  expect(filterBy(dupes, "pages", "api")).toEqual([
    ["pages/bar.ts", "app/ding/pages/bar.ts"].map(normalize),
  ])
})

test("filterBy", () => {
  expect(
    filterBy(
      [
        ["foo", "bar", "baz"],
        ["boo", "bar", "boo"],
      ],
      "foo",
    ),
  ).toEqual([["foo", "bar", "baz"]])

  expect(
    filterBy(
      [
        ["foo", "bar", "api", "baz"],
        ["boo", "bar", "boo"],
      ],
      "foo",
      "api",
    ),
  ).toEqual([])

  expect(
    filterBy(
      [
        ["foo", "bar", "baz"],
        ["boo", "bar", "boo"],
      ],
      "bar",
    ),
  ).toEqual([
    ["foo", "bar", "baz"],
    ["boo", "bar", "boo"],
  ])

  expect(
    filterBy(
      [
        ["foo", "bar", "baz"],
        ["boo", "foo", "boo"],
      ],
      "boo",
    ),
  ).toEqual([["boo", "foo", "boo"]])

  expect(
    filterBy(
      [
        ["foo", "bar", "baz"],
        ["boo", "foo", "boo"],
      ],
      "bozo",
    ),
  ).toEqual([])
})
