# ❤️ Blitz Maintainers

Aside from the core team, there are two levels of maintainers, described below.

## Becoming a Maintainer

We always need more level 1 maintainers! The main requirement is that you can show empathy when communicating online. We'll train you as needed on the other specifics. **This is a great role if you have limited time, because you can spend just as much time as you have without any ongoing responsibilities (unlike level 2)**

Level 2 maintainers have a much higher responsibility, so usually you will spend time as a level 1 maintainer before moving to level 2.

Please DM a core team member (Brandon Bayer, Rudi Yardley, or Dylan Brookes) in Slack if you're interested in becoming an official maintainer!

## Level 1 Maintainers

Level 1 maintainers are critical for a healthy Blitz community and project. They take a lot of burden off the core team and level 2 maintainers so they can focus on higher level things with longer term impact.

The primary responsibilities of level 1 maintainers are:

- Being a friendly, welcoming voice for the Blitz community
- Issue triage
- Pull request triage
- Monitor and answer the `#-help` slack channel
- Community encouragement
- Community moderation
- Tracking and ensuring progress of key issues

## Level 2 Maintainers

Level 2 maintainers are the backbone of the project. They are watchdogs over the code, ensuring code quality, correctness, and security. They also facilitate a rapid pace of progress.

The primary responsibilities of level 2 maintainers are:

- Code ownership over specific parts of the project
- Maintaining and improving the architecture of what they own
- Final pull request reviews
- Merging pull requests
- Tracking and ensuring progress of open pull requests

## ⚠️ Fundamentals

Maintainers are the face of the project and the front-line touch point for the community. Therefore maintainers have the very important responsibility of making people feel welcome, valued, understood, and appreciated.

**Please take time to read and understand everything outlined in this [guide on building welcoming communities](https://opensource.guide/building-community)**

Some especially important points:

- **Gratitude:** immediately express gratitude when someone opens an issue or PR. This takes effort/time and we appreciate it
- **Responsiveness:** during issue/PR triage, even if we can’t do a full review right away, leave a comment thanking them and saying we’ll review it soon
- **Understanding:** it's critical to ensure you understand exactly what someone is saying before you respond. Ask plenty of questions if needed. It's very bad if someone has to reply to your response and say "actually I was asking about X"
  - In fact, at least one question is almost always required before you can respond appropriately  — whether in Github or in Slack

## Slack

- All `#-*` channels are for Blitz users
- All `#dev-*` channels are for Blitz internal development

If someone that's not a maintainer post in the wrong area, that's fine. Don't tell them they posted in the wrong place. But as a maintainer, you should for sure post in the right channel :)

## Issue Triage

#### If a bug report:

- Does it have enough information? Versions? Logs? Some way to reproduce?
- Has this already been fixed in a previous release?
- Is there already an existing issue for this?

### If a feature/change request:

- Is it clear what the request is and what the benefit will be?
- Is this an obvious win for Blitz? Then accept it
- If not obvious, then pull in a core team member or level 2 maintainer for more review

### Actions

1. Add tags:
   - Add a `kind/*` tag
   - Add a `scope/*` tag
   - Add a `status/*` tag
   - Add a good first/second issue tag if appropriate

## Pull Request Triage

- Are the changes covered by tests?
- Do the changes look ok? Make sure there's no obvious issues

### Actions

1. Kindly request any changes if needed
2. Else add a Github approval so that level 2 maintainers know it's already had an initial review

## Final PR Review & Merging (Level 2 maintainers)

As a level 2 maintainer, it is your responsibility to make sure broken code and regressions never reach the canary branch.

1. Ensure the PR'ed code fully works as intended and that there are no regressions in related code
   1. If not fully covered by automated tests, you need to pull down the code locally and manually verify everything (the Github CLI helps with this!)
2. During squash & merge:
   1. Change the commit title to be public friendly - this exact text will go in the release notes
   2. Add the commit type in the description, in parenthesis like `(patch)`. Commit types:
      - `major` - major breaking change
      - `minor` - minor feature addition
      - `patch` - patches, bug fixes, perf improvements, etc
      - `example` - change to an example app
      - `meta` - internal meta change related to the Blitz repo/project
