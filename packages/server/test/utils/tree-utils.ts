import directoryTreeParser from 'directory-tree'

// there is an issue with directoryTree where stats filtering doesnt work as expected
export function stripNode(node: any, stripper: (a: any) => any) {
  const newNode = stripper(node)
  if (node.children?.length > 0) {
    newNode.children = node.children.map((child: any) => stripNode(child, stripper))
  }
  return newNode
}

export function directoryTree(folder: string, stripper: (a: any) => any = ({name}) => ({name})) {
  const tree = directoryTreeParser(folder)
  return stripNode(tree, stripper)
}
