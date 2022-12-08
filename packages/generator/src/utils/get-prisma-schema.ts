import * as ast from "@mrleebo/prisma-ast"
import {Editor} from "mem-fs-editor"
import {log} from "../utils/log"
import fs from "fs"
import path from "path"

function getDbFolder() {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json")
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readFileSync(packageJsonPath, "utf8")
      const packageJsonObj = JSON.parse(packageJson)
      if (!packageJsonObj.prisma || !packageJsonObj.prisma.schema) {
        return "db"
      }
      const prismaSchemaPath = path.join(process.cwd(), packageJsonObj.prisma.schema)
      if (!fs.existsSync(prismaSchemaPath)) {
        return "db"
      }
      const folder = packageJsonObj.prisma.schema.split("/")[0] as string
      return folder
    } else {
      return "db"
    }
  } catch (e) {
    if (fs.existsSync(path.join(process.cwd(), "db/schema.prisma"))) {
      return "db"
    }
    throw e
  }
}

export const getPrismaSchema = (
  memFsEditor: Editor,
): {schema: ast.Schema; schemaPath: string; dbFolder: string} => {
  const dbFolder = getDbFolder()
  const schemaPath = path.join(process.cwd(), dbFolder, "schema.prisma")
  if (!fs.existsSync(schemaPath)) {
    log.error(`Could not find schema.prisma file at ${schemaPath}`)
    return {schema: {type: "schema", list: []}, schemaPath, dbFolder}
  }
  let schema: ast.Schema
  try {
    schema = ast.getSchema(memFsEditor.read(schemaPath))
  } catch (err) {
    log.debug("Failed to parse db/schema.prisma file")
    throw err
  }
  return {schema, schemaPath, dbFolder}
}
