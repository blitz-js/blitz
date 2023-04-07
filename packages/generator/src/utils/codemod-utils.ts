import j, {Collection} from "jscodeshift"
import {capitalize, singleCamel} from "./inflector"

export function replaceImportDbWithPrismaFolder(program: Collection<any>) {
  const importDb = program.find(j.ImportDeclaration).filter((path) => {
    return path.value.source.value === "db"
  })
  importDb.replaceWith((path) => {
    path.value.source.value = "__prismaFolder__"
    return path.value
  })

  return program
}

export function insertLabeledSelectField(program: Collection<any>) {
  const importExists = program
    .find(j.ImportDeclaration)
    .filter((path) => path.node.source.value === "src/core/components/LabelSelectField")
    .size()
  if (!importExists) {
    program
      .find(j.ImportDeclaration)
      .at(-1)
      .insertAfter(
        j.importDeclaration(
          [j.importSpecifier(j.identifier("LabeledSelectField"))],
          j.literal("src/core/components/LabelSelectField"),
        ),
      )
  }
  return program
}

export function insertImportQuery(program: Collection<any>, templateValues: any) {
  program
    .find(j.ImportDeclaration)
    .at(-1)
    .insertAfter(
      j.importDeclaration(
        [
          j.importDefaultSpecifier(
            j.identifier(
              singleCamel("get" + capitalize(templateValues.parentModelId)).replace("Id", "s"),
            ),
          ),
        ],
        j.literal(
          `src/${templateValues.parentModelId.replace("Id", "s")}/queries/${
            "get" + capitalize(templateValues.parentModelId).replace("Id", "s")
          }`,
        ),
      ),
    )
  return program
}

export function insertImportPagnatedQuery(program: Collection<any>) {
  const importPaginatedQuery = program
    .find(j.ImportDeclaration)
    .filter((path) => {
      if (path.node.specifiers) {
        return (
          path.node.source.value === "@blitzjs/rpc" &&
          path.node.specifiers.filter((specifier) => {
            if (specifier.type === "ImportSpecifier") {
              return specifier.imported.name === "usePaginatedQuery"
            } else {
              return false
            }
          }).length > 0
        )
      } else {
        return false
      }
    })
    .size()
  if (!importPaginatedQuery) {
    program
      .find(j.ImportDeclaration)
      .at(-1)
      .insertAfter(
        j.importDeclaration(
          [j.importSpecifier(j.identifier("usePaginatedQuery"))],
          j.literal("@blitzjs/rpc"),
        ),
      )
  }
  return program
}

export function updateFormWithParent(program: Collection<any>, templateValues: any) {
  const modalFormSuspense = program.find(j.FunctionDeclaration).filter((path) => {
    if (path.node.id?.name) {
      return path.node.id.name.includes("Form")
    }
    return false
  })
  if (modalFormSuspense.size()) {
    modalFormSuspense
      .find(j.ReturnStatement)
      .at(-1)
      .insertBefore(
        j.variableDeclaration("const", [
          j.variableDeclarator(
            j.arrayPattern([
              j.objectPattern([
                j.objectProperty(
                  j.identifier(`${templateValues.parentModelId.replace("Id", "s")}`),
                  j.identifier(`${templateValues.parentModelId.replace("Id", "s")}`),
                ),
              ]),
            ]),
            j.callExpression(j.identifier("usePaginatedQuery"), [
              j.identifier("get" + capitalize(templateValues.parentModelId).replace("Id", "s")),
              j.objectExpression([
                j.objectProperty(
                  j.identifier("orderBy"),
                  j.objectExpression([
                    j.objectProperty(j.identifier("id"), j.stringLiteral("asc")),
                  ]),
                ),
              ]),
            ]),
          ),
        ]),
      )
    modalFormSuspense
      .find(j.JSXElement)
      .filter((path) => {
        return (
          path.node.openingElement.name.type === "JSXIdentifier" &&
          path.node.openingElement.name.name === "LabeledSelectField"
        )
      })
      .forEach((path) => {
        let value = ""
        path.node.openingElement.attributes = path.node.openingElement.attributes?.filter(
          (attribute) => {
            if (attribute.type === "JSXAttribute" && attribute.name.name === "type") {
              if (attribute.value?.type === "StringLiteral") {
                value = attribute.value.value
              }
              return false
            }
            return true
          },
        )
        path.node.openingElement.attributes?.push(
          j.jsxAttribute(j.jsxIdentifier("options"), j.jsxExpressionContainer(j.identifier(value))),
        )
      })
  }
  return program
}
