import visit from "unist-util-visit"

import {highlightCode} from "./utils"

export default withSyntaxHighlighting = () => {
  return (tree) => {
    visit(tree, "code", (node) => {
      let lang = node.lang || "bash"
      if (lang === "sh") {
        lang = "bash"
      }
      if (lang === "prisma") {
        lang = "graphql"
      }
      node.type = "html"
      node.value = [
        `<div class="my-6 rounded-xl overflow-hidden bg-code-block dark:bg-purple-dark-code">`,
        `<pre class="language-${lang}">`,
        `<code class="language-${lang}">`,
        highlightCode(node.value, lang),
        "</code>",
        "</pre>",
        "</div>",
      ]
        .filter(Boolean)
        .join("")
    })
  }
}
