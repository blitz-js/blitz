# How to Contribute to Blitz.js

We're so excited you're interested in helping with Blitz! We happy to help you get started, even if you don't have any previous open-source experience :)

### First Things First

1. Familiarize yourself with the [Blitz Code of Conduct](https://github.com/blitz-js/blitz/blob/canary/CODE_OF_CONDUCT.md)
2. Join the [Blitz Slack Community](https://slack.blitzjs.com)
3. Install the [Zenhub browser extension](https://www.zenhub.com/extension)
4. View open issues and their progress [on the Zenhub repo tab](https://github.com/blitz-js/blitz#zenhub)

### What to Work On?

Issues with the label `ready to work on | help wanted` are the best place to start. If you find one that looks interesting and no one else is already working on it, comment in the issue that you are going to work on it. Please ask as many questions as you need, either directly in the issue or in Slack. We're happy to help!

After you contribute in any way, please add yourself as a contributor via the [@all-contributors bot](https://allcontributors.org/docs/en/bot/usage)!

## Development Setup

#### Repo Setup

**1.** Clone the repo

```
git clone git@github.com:blitz-js/blitz.git
cd blitz
```

**2.** Install dependencies

```
yarn
```

**3.** Start the package server. This must be running for any package development or example development

```
yarn dev
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

#### Run a Blitz `example`

**NOTE:** There are currently no examples for the new architecture in the pending RFC.

**1.** Change to an example directory

```
cd examples/first-demo
```

**2.** Follow instructions in the example's README
