import * as ast from "@mrleebo/prisma-ast"
import {Editor} from "mem-fs-editor"
import {log} from "../utils/log"
import fs from "fs"
import path from "path"

//create a custom error class when prisma does not exist
export class PrismaSchemaNotFoundError extends Error {
  constructor() {
    super("Prisma schema not found.")
    this.name = "PrismaSchemaNotFoundError"
  }
}

function getDbFolder() {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json")
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readFileSync(packageJsonPath, "utf8")
      const packageJsonObj = JSON.parse(packageJson)
      if (!packageJsonObj.prisma || !packageJsonObj.prisma.schema) {
        throw new PrismaSchemaNotFoundError()
      }
      const prismaSchemaPath = path.join(process.cwd(), packageJsonObj.prisma.schema)
      if (!fs.existsSync(prismaSchemaPath)) {
        throw new PrismaSchemaNotFoundError()
      }
      const folder = packageJsonObj.prisma.schema.split("/")[0] as string
      return folder
    } else {
      throw new PrismaSchemaNotFoundError()
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
): {schema: ast.Schema; schemaPath: string; dbFolder: string} | boolean => {
  let dbFolder: string, schemaPath: string
  try {
    dbFolder = getDbFolder()
    schemaPath = path.join(process.cwd(), dbFolder, "schema.prisma")
  } catch (e) {
    if (e instanceof PrismaSchemaNotFoundError) {
      return false
    }
    throw e
  }
  if (!fs.existsSync(schemaPath)) {
    return {schema: {type: "schema", list: []}, schemaPath, dbFolder}
  }
  let schema: ast.Schema
  try {
    schema = ast.getSchema(memFsEditor.read(schemaPath))
  } catch (err) {
    log.debug("Failed to parse schema.prisma file")
    throw err
  }
  return {schema, schemaPath, dbFolder}
}
