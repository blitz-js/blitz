import { user } from "./user"
export * from "./user"

export const Factories = {
  user,
}

export function factory<T extends keyof typeof Factories>({
  name,
  attrs,
}: {
  name: T
  attrs: Parameters<typeof Factories[T]>[0]
}) {
  return Factories[name](attrs)
}
