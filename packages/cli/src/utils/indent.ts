export function indent(arg: string, level: number) {
  const padding = "".padStart(level, " ")
  return arg
    .split("\n")
    .map((part) => `${padding}${part}`)
    .join("\n")
}
