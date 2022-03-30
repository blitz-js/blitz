import * as ast from "@mrleebo/prisma-ast"
import {singlePascal} from "../utils/inflector"
import {Field} from "./field"

export class Model {
  name: string
  fields: Field[]

  constructor(name: string, fields: Field[] = []) {
    this.name = singlePascal(name)
    this.fields = fields
  }

  appendTo(schema: ast.Schema): ast.Model {
    const model = this.createModelAst()
    schema.list.push(model)
    return model
  }

  private createModelAst(): ast.Model {
    const properties = [
      this.getIdField(),
      this.getCreatedAtField(),
      this.getUpdatedAtField(),
    ].filter(Boolean) as ast.Field[]

    const model: ast.Model = {
      type: "model",
      name: this.name,
      properties,
    }

    for (const field of this.fields) field.appendTo(model)

    return model
  }

  private getIdField(): ast.Field | undefined {
    if (this.fieldExists("id")) return
    return {
      type: "field",
      name: "id",
      fieldType: "Int",
      attributes: [
        {
          type: "attribute",
          kind: "field",
          name: "id",
        },
        {
          type: "attribute",
          kind: "field",
          name: "default",
          args: [
            {
              type: "attributeArgument",
              value: {
                type: "function",
                name: "autoincrement",
                params: [],
              },
            },
          ],
        },
      ],
    }
  }

  private getCreatedAtField(): ast.Field | undefined {
    if (this.fieldExists("createdAt")) return
    return {
      type: "field",
      name: "createdAt",
      fieldType: "DateTime",
      attributes: [
        {
          type: "attribute",
          kind: "field",
          name: "default",
          args: [
            {
              type: "attributeArgument",
              value: {
                type: "function",
                name: "now",
                params: [],
              },
            },
          ],
        },
      ],
    }
  }

  private getUpdatedAtField(): ast.Field | undefined {
    if (this.fieldExists("updatedAt")) return
    return {
      type: "field",
      name: "updatedAt",
      fieldType: "DateTime",
      attributes: [
        {
          type: "attribute",
          kind: "field",
          name: "updatedAt",
        },
      ],
    }
  }

  private fieldExists(name: string): boolean {
    return this.fields.some((field) => field.name === name)
  }

  toString(): string {
    return ast.printSchema({
      type: "schema",
      list: [this.createModelAst()],
    })
  }
}
