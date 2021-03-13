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
export default {
  Home: "home/",
  CommentView: ({ postId, openedCommentPath }) => \`posts/$\{postId\}/$\{openedCommentPath.join("/")\}\`
}
      `.trim(),
    declaration: `
declare const _default: {
  Home: string;
  CommentView({ postId, openedCommentPath }: { postId: string, openedCommentPath: string[] }): string;
}
export default _default;
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
