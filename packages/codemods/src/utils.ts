import path from "path"
import * as fs from "fs-extra"
import j, {
  ASTPath,
  Collection,
  FunctionDeclaration,
  VariableDeclaration,
  ExportDefaultDeclaration,
  ImportDeclaration,
  CallExpression,
} from "jscodeshift"
import {parseSync} from "@babel/core"

export function findFunction(
  program: Collection<any>,
  declarationName: string,
): Collection<FunctionDeclaration> | Collection<VariableDeclaration> | null {
  const funcDeclaration = program.find(
    j.FunctionDeclaration,
    (node) => node.id.name === declarationName,
  )

  const constDeclaration = program.find(
    j.VariableDeclaration,
    (node) => node.declarations[0].id.name === declarationName,
  )

  const paths = funcDeclaration.length
    ? funcDeclaration
    : constDeclaration.length
    ? constDeclaration
    : null

  return paths
}

export function findVariable(
  program: Collection<any>,
  declarationName: string,
): Collection<VariableDeclaration> | null {
  const constDeclaration = program.find(
    j.VariableDeclaration,
    (node) => node.declarations[0].id.name === declarationName,
  )

  const paths = constDeclaration.length ? constDeclaration : null

  return paths
}

export function findImport(
  program: Collection<any>,
  declarationName: string,
): Collection<ImportDeclaration> | null {
  const importDeclaration = program.find(
    j.ImportDeclaration,
    (node) => node.source.value === declarationName,
  )

  const paths = importDeclaration.length ? importDeclaration : null

  return paths
}

export function findCallExpression(
  program: Collection<any>,
  declarationName: string,
): Collection<CallExpression> | null {
  const callExpression = program.find(
    j.CallExpression,
    (node) => node.callee.name === declarationName,
  )

  const paths = callExpression.length ? callExpression : null

  return paths
}

export function findDefaultExportPath(
  program: Collection<any>,
): ASTPath<ExportDefaultDeclaration> | null | undefined {
  const defaultDeclaration = program.find(j.ExportDefaultDeclaration)
  return defaultDeclaration.length ? defaultDeclaration.paths()[0] : null
}

export function wrapDeclaration(
  path: ASTPath<FunctionDeclaration> | ASTPath<VariableDeclaration>,
  declaration: string,
  wrapper: string,
) {
  if (path.node.type === "FunctionDeclaration") {
    // CASE 1
    //   function myFunction()
    // TURNS INTO
    //   const myFunction = wrapper(function myFunction () {})
    path.replace(
      j.variableDeclaration("const", [
        j.variableDeclarator(
          j.identifier(declaration),
          j.callExpression(j.identifier(wrapper), [
            j.functionExpression.from({
              id: path.node.id,
              async: path.node.async,
              body: path.node.body,
              params: path.node.params,
              typeParameters: path.node.typeParameters,
              defaults: path.node.defaults,
              expression: path.node.expression,
              generator: path.node.generator,
              returnType: path.node.returnType,
              rest: path.node.rest,
              comments: path.node.comments ?? null,
            }),
          ]),
        ),
      ]),
    )
  } else if (path.node.type === "VariableDeclaration") {
    // CASE 2
    //   const myFunction = () => {}
    // TURNS INTO
    //   const myFunction = gSSP(() => {})
    for (const declaration of path.node.declarations) {
      if (declaration.type === "VariableDeclarator" && declaration.init) {
        const init = declaration.init

        // Running the codemod twice should not wrap in `gSSP` twice.
        if (
          init.type === "CallExpression" &&
          init.callee.type === "Identifier" &&
          init.callee.name === wrapper
        ) {
          // For 100% confidence, we could probably check if gSSP is imported from Blitz here
          // but this codemod adds the gSSP import.
          continue
        }

        declaration.init = j.callExpression(j.identifier(wrapper), [init])

        break
      }
    }
  }
}

export function addNamedImport(
  program: Collection<any>,
  importStatement: string,
  importFrom: string,
  defaultSpecifier?: boolean,
) {
  const existingImport = program.find(
    j.ImportDeclaration,
    (node) => node.source.value === importFrom,
  )

  if (existingImport.length) {
    existingImport.get().value.specifiers.push(j.importSpecifier(j.identifier(importStatement)))
  } else {
    program
      .get()
      .value.program.body.unshift(
        defaultSpecifier
          ? j.importDeclaration(
              [j.importDefaultSpecifier(j.identifier(importStatement))],
              j.stringLiteral(importFrom),
            )
          : j.importDeclaration(
              [j.importSpecifier(j.identifier(importStatement))],
              j.stringLiteral(importFrom),
            ),
      )
  }
}

export function getAllFiles(
  dirPath: string,
  accFiles: string[] = [],
  skipDirs?: string[],
  skipExt?: string[],
) {
  let currentFiles = fs.readdirSync(dirPath)

  currentFiles.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (!skipDirs?.includes(file)) {
        accFiles = getAllFiles(dirPath + "/" + file, accFiles, skipDirs, skipExt)
      }
    } else {
      if (!skipExt?.includes(path.extname(file))) {
        accFiles.push(path.join(dirPath, "/", file))
      }
    }
  })
  return accFiles
}

export function getCollectionFromSource(filename: string) {
  const fileSource = fs.readFileSync(path.resolve(filename), {encoding: "utf-8"})
  return j(fileSource, {
    parser: {
      parse: (source: string) =>
        parseSync(source, {
          configFile: false,
          plugins: [require(`@babel/plugin-syntax-jsx`)],
          overrides: [
            {
              test: [`**/*.ts`, `**/*.tsx`],
              plugins: [[require(`@babel/plugin-syntax-typescript`), {isTSX: true}]],
            },
          ],
          filename,
          parserOpts: {
            tokens: true, // recast uses this
          },
        }),
    },
  })
}
