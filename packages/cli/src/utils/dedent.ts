export function dedent(strings: TemplateStringsArray, ...args: any[]) {
  return strings
    .map((str, idx) => str + String(args[idx] || ''))
    .join('')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
}
