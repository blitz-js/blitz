import {
  generateManifest,
  parseDefaultExportName,
  parseParametersFromRoute,
} from "./route-import-manifest"

test("parseParametersFromRoute", () => {
  expect(parseParametersFromRoute("posts/[postId]/[...openedCommentPath]")).toEqual({
    parameters: ["postId"],
    multipleParameters: ["openedCommentPath"],
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
        parameters: ["postId"],
        multipleParameters: ["openedCommentPath"],
      },
    }),
  ).toEqual({
    implementation: `
exports.Routes = {
  Home: (query) => ({ pathname: "home/", query }),
  CommentView: (query) => ({ pathname: "posts/[postId]/[...openedCommentPath]", query })
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
