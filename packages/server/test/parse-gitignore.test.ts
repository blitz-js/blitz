import parseGitignore from 'parse-gitignore'

describe('parse-gitignore', () => {
  describe('when given a .gitignore file', () => {
    it('returns individual rules', () => {
      const rules = parseGitignore(`
# npm
node_modules/**/*

# important vscode files
!.vscode/important.json
        `)

      expect(rules).toEqual(['node_modules/**/*', '!.vscode/important.json'])
    })
  })

  describe('when given an empty file', () => {
    it('returns an empty array', () => {
      const rules = parseGitignore('')

      expect(rules).toEqual([])
    })
  })
})
