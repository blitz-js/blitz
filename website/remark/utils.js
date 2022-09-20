import Prism from "prismjs"
global.Prism = Prism

import loadLanguages from "prismjs/components/index"
loadLanguages()

import {prismDiffHighlight} from "./prism-diff-highlight"
// import {prismLineNumbers} from "./prism-line-numbers"

prismDiffHighlight(Prism)
// prismLineNumbers(Prism)

const HTML_TAG =
  /<\/?(?!\d)[^\s>/=$<%]+(?:\s(?:\s*[^\s>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/gi
const PSEUDO_CLASSES = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  "host",
  "host",
  "host-context",
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  "lang",
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  "nth-child",
  "nth-col",
  "nth-last-child",
  "nth-last-col",
  "nth-last-of-type",
  "nth-of-type",
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "picture-in-picture",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "state",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where",
]

Prism.hooks.add("wrap", (env) => {
  if (env.type === "atrule") {
    const content = env.content.replace(HTML_TAG, "")
    if (content.startsWith("@apply")) {
      env.classes.push("atapply")
    }
  } else if (env.type === "pseudo-class") {
    if (!new RegExp(`^::?(${PSEUDO_CLASSES.join("|")})`).test(env.content)) {
      env.classes = env.classes.filter((x) => x !== "pseudo-class")
    }
  }
})

export function addImport(tree, mod, name) {
  tree.children.unshift({
    type: "import",
    value: `import { ${name} as _${name} } from '${mod}'`,
  })
  return `_${name}`
}

export function addDefaultImport(tree, mod, name) {
  tree.children.unshift({
    type: "import",
    value: `import _${name} from '${mod}'`,
  })
  return `_${name}`
}

export function addExport(tree, name, value) {
  tree.children.push({
    type: "export",
    value: `export const ${name} = ${JSON.stringify(value)}`,
  })
}

export function highlightCode(code, prismLanguage) {
  const isDiff = prismLanguage.startsWith("diff-")
  const language = isDiff ? prismLanguage.substr(5) : prismLanguage
  const grammar = Prism.languages[isDiff ? "diff" : language]
  if (!grammar) {
    console.warn(`Unrecognised language: ${prismLanguage}`)
    return Prism.util.encode(code)
  }
  code = code
    .replace(/[^\S\r\n]*(?=\/\/ highlight-start)/g, "")
    .replace(/[^\S\r\n]*(?=\/\/ highlight-end)/g, "")
  let highlighted = Prism.highlight(code, grammar, prismLanguage)

  return highlighted
    .replace(
      /(<span(?:(?!<span)[\s\S])*(\/\/ ?highlight-start))[\S\s]*?((\/\/ ?highlight-end)[\S\s]*?(>))/g,
      (text) => `<div class="token highlighted">${text}</div>`,
    )
    .replace(/\w*\/\/ ?highlight-start\w*/g, "")
    .replace(/\w*\/\/ ?highlight-end\w*/g, "")
    .replace(
      /^.*\/\/ ?highlight-line.*$/gm,
      (text) => `<div class="token highlighted">${text}</div>`,
    )
    .replace(/<span class="token comment">\/\/ ?highlight-line<\/span>/g, "")
}
