import {
  generateManifest,
  parseDefaultExportName,
  parseParametersFromRoute,
} from "./route-import-manifest"

describe("parseParametersFromRoute", () => {
  it("supports being passed a route with single and multiple  parameters", () => {
    expect(parseParametersFromRoute("posts/[postId]/[...openedCommentPath]")).toEqual({
      parameters: [
        {
          name: "postId",
          optional: false,
        },
      ],
      multipleParameters: [
        {
          name: "openedCommentPath",
          optional: false,
        },
      ],
    })
  })
  it("supports being passed an optional catch-all parameter", () => {
    expect(parseParametersFromRoute("posts/[[...openedCommentPath]]")).toEqual({
      parameters: [],
      multipleParameters: [
        {
          name: "openedCommentPath",
          optional: true,
        },
      ],
    })
  })
  it("supports being passed a mix of single parameters and optional catch-all parameters", () => {
    expect(parseParametersFromRoute("posts/[postId]/[[...openedCommentPath]]")).toEqual({
      parameters: [
        {
          name: "postId",
          optional: false,
        },
      ],
      multipleParameters: [
        {
          name: "openedCommentPath",
          optional: true,
        },
      ],
    })
  })
})

test("generateManifest", () => {
  expect(
    generateManifest({
      "home/": {
        name: "Home",
        parameters: [],
        multipleParameters: [],
      },
      "posts/[postId]/[...openedCommentPath]": {
        name: "CommentView",
        parameters: [
          {
            name: "postId",
            optional: false,
          },
        ],
        multipleParameters: [
          {
            name: "openedCommentPath",
            optional: false,
          },
        ],
      },
      "users/[userId]/[[...openedPhotoId]]": {
        name: "UserProfileView",
        parameters: [
          {
            name: "userId",
            optional: false,
          },
        ],
        multipleParameters: [
          {
            name: "openedPhotoId",
            optional: true,
          },
        ],
      },
    }),
  ).toEqual({
    implementation: `
exports.Routes = {
  Home: (query) => ({ pathname: "home/", query }),
  CommentView: (query) => ({ pathname: "posts/[postId]/[...openedCommentPath]", query }),
  UserProfileView: (query) => ({ pathname: "users/[userId]/[[...openedPhotoId]]", query })
}
      `.trim(),
    declaration: `
import type { UrlObject } from "url"
import type { ParsedUrlQueryInput } from "querystring"

interface RouteUrlObject extends Pick<UrlObject, 'pathname' | 'query'> {
  pathname: string
}

export const Routes: {
  Home(query?: ParsedUrlQueryInput): RouteUrlObject;
  CommentView(query: { postId: string | number; openedCommentPath: (string | number)[] } & ParsedUrlQueryInput): RouteUrlObject;
  UserProfileView(query: { userId: string | number; openedPhotoId?: (string | number)[] } & ParsedUrlQueryInput): RouteUrlObject;
}
      `.trim(),
  })
})

test("parseDefaultExportName", () => {
  expect(parseDefaultExportName("export default MyRoute")).toBe("MyRoute")
  expect(parseDefaultExportName("export default const MyRoute")).toBe("MyRoute")
  expect(parseDefaultExportName("export default let MyRoute")).toBe("MyRoute")
  expect(parseDefaultExportName("export default class MyRoute {}")).toBe("MyRoute")
  expect(parseDefaultExportName("export default function MyRoute() {}")).toBe("MyRoute")
  expect(parseDefaultExportName("export const hello = ")).toBe(null)
})
