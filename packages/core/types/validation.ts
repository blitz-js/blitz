export type ValidationFn<U = any> = (data: U) => Record<string, any> | Promise<Record<string, any>>
