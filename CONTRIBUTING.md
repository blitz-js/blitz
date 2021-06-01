# Contributing

[Read the Contributing Guide at Blitzjs.com](https://blitzjs.com/docs/contributing)

## Notes For Core Team

### Syncing Next.js Fork

1. Run `yarn push-nextjs`
   - If it fails with an error of `git-subrepo: Can't commit: 'subrepo/nextjs' doesn't contain upstream HEAD:`, then run `yarn push-nextjs --force` (see https://github.com/ingydotnet/git-subrepo/issues/530)
2. Create new git branch for the upgrade
3. In the forked repo (https://github.com/blitz-js/next.js), run:
   1. `git pull`
   2. `git fetch --all`
   3. `git merge v10.2.0` (change the version to be the version you are updating to)
   4. Resolve all merge conflicts and complete merge
   5. `git push`
4. Run `yarn pull next-nextjs`
   - If it fails, run `git subrepo clean nextjs` and try again
5. Run `yarn`
6. Run `yarn manypkg check` and optionally `yarn manypkg fix` to fix any issues
7. Under `nextjs/`, run `./check-pre-compiled.sh` and commit the changes
8. Run `yarn build:nextjs`
9. Run `yarn lint` - fix any issues
10. Run `yarn build` - fix any issues
11. Run `yarn test:nextjs-size` and update tests if there are any failures
12. Open PR and fix any failing tests
13. Any doc updates?
