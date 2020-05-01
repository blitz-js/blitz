import {chokidarRulesFromGitignore} from '../src/parse-chokidar-rules-from-gitignore'

describe('chokidarRulesFromGitignore', () => {
  describe('when passed a simple, prefixed .gitignore file', () => {
    it('returns the prefixed chokidar rules', () => {
      expect(
        chokidarRulesFromGitignore({
          prefix: 'src/app/db',
          gitIgnore: `
.db_log
!migrations
        `,
        }),
      ).toEqual({
        ignoredPaths: ['src/app/db/.db_log'],
        includePaths: ['src/app/db/migrations'],
      })
    })
  })
})
