export const dethunkify = <T>(value: T | (() => T)): T =>
  typeof value === "function" ? (value as () => T)() : value
