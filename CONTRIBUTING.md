![Blitz Contributing Guide](https://raw.githubusercontent.com/blitz-js/art/master/contributing-guide.png)

<br>

We're so excited you're interested in helping with Blitz! We happy to help you get started, even if you don't have any previous open-source experience :)

<br>

### Blitz is a Community Project

Blitz is built by and for the community. There's no large company sponsoring development. So all community contributions are very appreciated!

<br>

### Our Codebase is a Garden

The Blitz codebase is like a community garden. There's a lot of beautiful plants and vegetables, but it won't take long until you find some weeds! When you find weeds, please remove them :) Minor refactoring is always encouraged. If you'd like to do some major refactoring, it's best to first either open an issue or check with us in Slack. Most likely we'll agree with you.

<br>

### First Things First

1. New to open source? take a look at [How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)
2. Familiarize yourself with the [Blitz Code of Conduct](https://github.com/blitz-js/blitz/blob/canary/CODE_OF_CONDUCT.md)
3. Join the [Blitz Slack Community](https://slack.blitzjs.com)

<br>

### Weekly Contributors video call

Every week Blitz contributors meet in a video call to discuss progress and ideas.

The contributor video call is mainly for those contributing or want to start contributing. However anyone is welcome to join and listen!

#### The timezone

We are literally all over the globe, so the weekly contributors call alternates timezones every other week to accomodate different regions

- Even weeks of the year: **Tuesday at 1am UTC** (Note: this is Monday evening in the USA)
- Odd weeks of the year: **Wednesday at 9am UTC**
- Use this link to see [the current week of the year](https://whatweekisit.com)

#### How to join

Zoom link will be posted in slack `#-announcements` channel before the call

#### Recording

Recordings of previous calls can be found [here](https://www.youtube.com/playlist?list=PLvm6NqxNNnBLFxZux5OHraTAcIBJz2FvR)

<br>

### What to Work On?

Issues with the label [`status/ready-to-work-on`](https://github.com/blitz-js/blitz/labels/status%2Fready-to-work-on) are the best place to start. If you find one that looks interesting and no one else is already working on it, comment in the issue that you are going to work on it. Please ask as many questions as you need, either directly in the issue or in Slack. We're happy to help!

The Blitzjs.com website and documentation repo also has issues with [`ready to work on | help wanted`](https://github.com/blitz-js/blitzjs.com/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22ready+to+work+on+%7C+help+wanted%22).

#### Things that are ALWAYS welcome

- Adding tests
- Improved documentation
- Improved error messages
- Improved logging (i.e. more clear, more beautiful)
- Performance or security improvements
- Educational content like blogs, videos, courses

If there's some other way you'd like to contribute, just ask us about it in slack!

After you contribute in any way, please add yourself as a contributor via the [@all-contributors bot](https://allcontributors.org/docs/en/bot/usage)!

<br>

## Development Setup

**1.** Fork this repo

**2.** Clone your fork repo

```sh
# If you didn't fork the repo use blitz-js as the USERNAME
git clone git@github.com:USERNAME/blitz.git
cd blitz
```

**3.** Install dependencies

```
yarn
```

**4.** Start the package server. This must be running for any package development or example development

```
yarn dev
```

**5.** Run tests

```
yarn test
```

#### Sync your fork

```sh
./scripts/fetchRemote.sh
git merge upstream/canary
```

#### Link the Blitz CLI (Optional)

The following will link the development CLI as a local binary so you can use it anywhere for testing.

```
yarn link-cli
// `yarn unlink-cli`  will unlink
```

#### Develop a Blitz `package`

**1.** Change to a package directory

```
cd packages/core
```

**2.** Start the test runner

```
yarn test:watch
```

#### Develop a Blitz `example`

**1.** Change to an example directory

```
cd examples/store
```

**2.** Follow instructions in the example's README

## Troubleshooting

If you run into issues that should be documented here, please submit a PR! ❤️

**#### Windows Subsystem for Linux**

`node-pty` error when running `yarn`. Fix by installing `node-pty dependencies`

```
sudo apt install -y make python build-essential
```
