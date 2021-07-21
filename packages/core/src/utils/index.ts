import {ZodError} from "zod"

export const isServer = typeof window === "undefined"
export const isClient = typeof window !== "undefined"

export function clientDebug(...args: any) {
  if (typeof window !== "undefined" && (window as any)["DEBUG_BLITZ"]) {
    console.log("[BLITZ]", Date.now(), ...args)
  }
}

export function formatZodError(error: ZodError) {
  if (!error || typeof error.format !== "function") {
    throw new Error("The argument to formatZodError must be a zod error with error.format()")
  }

  const errors = error.format()
  return recursiveFormatZodErrors(errors)
}

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

export const validateZodSchema = (schema: any) => (values: any): any => {
  if (!schema) return {}
  try {
    schema.parse(values)
    return {}
  } catch (error) {
    return error.format ? formatZodError(error) : error.toString()
  }
}
