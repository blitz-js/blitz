# Contributing

[Read the Contributing Guide at Blitzjs.com](https://blitzjs.com/docs/contributing)

## Notes For Core Team

### Syncing Next.js Fork

1. Run `yarn push-nextjs`
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
6. Under `nextjs/`, run `./check-pre-compiled.sh` and commit the changes
7. Run `yarn test:nextjs-size` and update tests if there are any failures
8. Open PR and fix any failing tests
