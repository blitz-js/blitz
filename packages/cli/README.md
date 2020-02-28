# blitz-cli

Blitz CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/blitz-cli.svg)](https://npmjs.org/package/blitz-cli)
[![Downloads/week](https://img.shields.io/npm/dw/blitz-cli.svg)](https://npmjs.org/package/blitz-cli)
[![License](https://img.shields.io/npm/l/blitz-cli.svg)](https://github.com/mabadir/blitz-cli/blob/master/package.json)

## Contributing

Run `yarn` from the monorepo root

**Run locally from this directory:**
`yarn b [COMMAND]`

**Run tests:**
`yarn test`

**Build package:**
`yarn build`

<!-- toc -->

- [blitz-cli](#blitz-cli)
- [Usage](#usage)
- [Commands](#commands)
  <!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @blitzjs/cli
$ blitz COMMAND
running command...
$ blitz (-v|--version|version)
@blitzjs/cli/0.0.1 darwin-x64 node-v12.16.1
$ blitz --help [COMMAND]
USAGE
  $ blitz COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`blitz help [COMMAND]`](#blitz-help-command)
- [`blitz new [PATH]`](#blitz-new-path)

## `blitz help [COMMAND]`

display help for blitz

```
USAGE
  $ blitz help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `blitz new [PATH]`

Create a new Blitz project

```
USAGE
  $ blitz new [PATH]

ARGUMENTS
  PATH  path to the new project, defaults to the current directory

OPTIONS
  -h, --help     show CLI help
  -t, --[no-]ts  generate a TypeScript project
  --yarn         use Yarn as the package manager
```

_See code: [lib/commands/new.js](https://github.com/blitz-js/blitz/blob/v0.0.1/lib/commands/new.js)_

<!-- commandsstop -->
