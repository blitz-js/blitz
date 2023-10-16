import * as z from "zod"

export function zodValidate<T extends z.ZodObject<any, any>, U = keyof T>(schema: T, field: U) {
  return (value: string): string => {
    const result = schema
      .pick({
        [field as string]: true,
      })
      .safeParse({
        [field as string]: value,
      })
    if (result.success) {
      return ""
    } else {
      return JSON.parse(result.error.message)[0].message
    }
  }
}
