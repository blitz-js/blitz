import {CommentKind, TypeAnnotationKind, TSTypeAnnotationKind} from "ast-types/gen/kinds"
import j from "jscodeshift"

export function withComments<
  Node extends {
    comments?: CommentKind[] | null
  },
>(node: Node, comments: CommentKind[]): Node {
  node.comments = comments
  return node
}

export function withTypeAnnotation<
  Node extends {
    typeAnnotation?: TypeAnnotationKind | TSTypeAnnotationKind | null
  },
>(node: Node, type: Parameters<typeof j.tsTypeAnnotation>[0]): Node {
  node.typeAnnotation = j.tsTypeAnnotation(type)
  return node
}
