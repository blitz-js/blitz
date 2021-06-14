export const isServer = typeof window === "undefined"
export const isClient = typeof window !== "undefined"

export function clientDebug(...args: any) {
  if (typeof window !== "undefined" && (window as any)["DEBUG_BLITZ"]) {
    console.log("[BLITZ]", Date.now(), ...args)
  }
}

export function formatZodErrors(errors: any) {
  let formattedErrors: Record<string, any> = {}

  for (const key in errors) {
    if (key === "_errors") {
      continue
    }

    if (errors[key]._errors[0]) {
      formattedErrors[key] = errors[key]._errors[0]
    } else {
      formattedErrors[key] = formatZodErrors(errors[key])
    }
  }

  return formattedErrors
}

export const validateZodSchema = (schema: any) => (values: any): any => {
  try {
    schema.parse(values)
    return {}
  } catch (error) {
    return error.format ? formatZodErrors(error.format()) : error.toString()
  }
}
