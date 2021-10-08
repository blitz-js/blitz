import * as ast from "@mrleebo/prisma-ast"
import path from "path"
import {log} from "@blitzjs/display"
import {Editor} from "mem-fs-editor"

export const getPrismaSchema = (memFsEditor : Editor): {schema: ast.Schema, schemaPath: string} => {
  const schemaPath = path.resolve("db/schema.prisma")
  if (!memFsEditor.exists(schemaPath)) {
    throw new Error("Prisma schema file was not found")
  }

  let schema: ast.Schema
  try {
    schema = ast.getSchema(memFsEditor.read(schemaPath))
  } catch (err) {
    log.error("Failed to parse db/schema.prisma file")
    throw err
  }
  return {schema, schemaPath}
}
