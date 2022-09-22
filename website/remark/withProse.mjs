const proseComponents = ["Heading"]

const isJsNode = (node) => {
  return (
    ["jsx", "import", "export"].includes(node.type) &&
    !/^<[a-z]+(>|\s)/.test(node.value) &&
    !new RegExp(`^<(${proseComponents.join("|")})(>|\\s)`).test(node.value)
  )
}

export const withProse = () => {
  return (tree) => {
    let insideProse = false
    tree.children = tree.children.flatMap((node, i) => {
      if (insideProse && isJsNode(node)) {
        insideProse = false
        return [{type: "jsx", value: "</div>"}, node]
      }
      if (!insideProse && !isJsNode(node)) {
        insideProse = true
        return [
          {type: "jsx", value: '<div className="prose xl:prose-xl dark:prose-dark">'},
          node,
          ...(i === tree.children.length - 1 ? [{type: "jsx", value: "</div>"}] : []),
        ]
      }
      if (i === tree.children.length - 1 && insideProse) {
        return [node, {type: "jsx", value: "</div>"}]
      }
      return [node]
    })
  }
}
