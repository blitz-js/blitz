import {fullTransformer, findDuplicates, filterBy} from "."
import {normalize} from "path"

test("should filter by path", () => {
  expect(fullTransformer(normalize("app/foo/pages/api/bar"))).toBe(normalize("pages/api/bar"))
  expect(fullTransformer(normalize("app/foo/api/bar"))).toBe(normalize("pages/api/bar"))

  const dupes = findDuplicates(
    [
      "app/foo/pages/api/bar",
      "app/pages/api/bar",
      "app/api/bar",
      "pages/bar",
      "app/ding/pages/bar",
    ].map(normalize),
    fullTransformer,
  )

  expect(dupes).toEqual([
    ["app/foo/pages/api/bar", "app/pages/api/bar", "app/api/bar"].map(normalize),
    ["pages/bar", "app/ding/pages/bar"].map(normalize),
  ])
  expect(filterBy(dupes, "api")).toEqual([
    ["app/foo/pages/api/bar", "app/pages/api/bar", "app/api/bar"].map(normalize),
  ])
  expect(filterBy(dupes, "pages", "api")).toEqual([
    ["pages/bar", "app/ding/pages/bar"].map(normalize),
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
