declare module 'jscodeshift/src/Runner' {
  function run(transform: (...args: any[]) => void, filepath: string, options: any): void
}
