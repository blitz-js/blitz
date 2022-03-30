export function matchBetween(test: string, start: string, end: string) {
  const re = new RegExp(`${start}([\\s\\S]*?)${end}`, "g")
  const match = test.match(re)

  if (match) {
    return match[0]
  }

  return match
}
