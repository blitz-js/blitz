import type {ZodError} from "zod"

export type ParserType = "sync" | "async"

export function recursiveFormatZodErrors(errors: any) {
  let formattedErrors: Record<string, any> = {}

  for (const key in errors) {
    if (key === "_errors") {
      continue
    }

    if (errors[key]?._errors?.[0]) {
      if (!isNaN(key as any) && !Array.isArray(formattedErrors)) {
        formattedErrors = []
      }
      formattedErrors[key] = errors[key]._errors[0]
    } else {
      if (!isNaN(key as any) && !Array.isArray(formattedErrors)) {
        formattedErrors = []
      }
      formattedErrors[key] = recursiveFormatZodErrors(errors[key])
    }
  }

  return formattedErrors
}

export function formatZodError(error: ZodError) {
  if (!error || typeof error.format !== "function") {
    throw new Error("The argument to formatZodError must be a zod error with error.format()")
  }

  const errors = error.format()
  return recursiveFormatZodErrors(errors)
}

const validateZodSchemaSync =
  (schema: any): any =>
  (values: any) => {
    if (!schema) return {}
    try {
      schema.parse(values)
      return {}
    } catch (error: any) {
      return error.format ? formatZodError(error) : error.toString()
    }
  }

const validateZodSchemaAsync = (schema: any) => async (values: any) => {
  if (!schema) return {}
  try {
    await schema.parseAsync(values)
    return {}
  } catch (error: any) {
    return error.format ? formatZodError(error) : error.toString()
  }
}

// type zodSchemaReturn = typeof validateZodSchemaAsync | typeof validateZodSchemaSync
// : (((values:any) => any) | ((values:any) => Promise<any>)) =>
export function validateZodSchema(schema: any, parserType: "sync"): (values: any) => any
export function validateZodSchema(schema: any, parserType: "async"): (values: any) => Promise<any>
export function validateZodSchema(schema: any): (values: any) => Promise<any>
export function validateZodSchema(schema: any, parserType: ParserType = "async") {
  if (parserType === "sync") {
    return validateZodSchemaSync(schema)
  } else {
    return validateZodSchemaAsync(schema)
  }
}
