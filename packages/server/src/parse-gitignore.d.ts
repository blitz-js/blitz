declare module 'parse-gitignore' {
  function parse(dotGitignore: string): string[]
  export default parse
}
