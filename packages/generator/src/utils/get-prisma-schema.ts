import * as ast from "@mrleebo/prisma-ast"
import {Editor} from "mem-fs-editor"
import {log} from "../utils/log"
import path from "path"

export const getPrismaSchema = (memFsEditor: Editor): {schema: ast.Schema; schemaPath: string} => {
  const schemaPath = path.resolve("db/schema.prisma")
  if (!memFsEditor.exists(schemaPath)) {
    throw new Error("Prisma schema file was not found")
  }

  let schema: ast.Schema
  try {
    schema = ast.getSchema(memFsEditor.read(schemaPath))
  } catch (err) {
    log.debug("Failed to parse db/schema.prisma file")
    throw err
  }
  return {schema, schemaPath}
}
