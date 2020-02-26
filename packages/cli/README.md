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

- [Usage](#usage)
- [Commands](#commands)
  <!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g blitz-cli
$ blitz COMMAND
running command...
$ blitz (-v|--version|version)
blitz-cli/0.0.0 darwin-x64 node-v12.14.1
$ blitz --help [COMMAND]
USAGE
  $ blitz COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`blitz console [FILE]`](#blitz-console-file)
- [`blitz db [FILE]`](#blitz-db-file)
- [`blitz generate [FILE]`](#blitz-generate-file)
- [`blitz help [COMMAND]`](#blitz-help-command)
- [`blitz new [FILE]`](#blitz-new-file)
- [`blitz run [FILE]`](#blitz-run-file)
- [`blitz start [FILE]`](#blitz-start-file)

## `blitz console [FILE]`

describe the command here

```
USAGE
  $ blitz console [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/console.ts](https://github.com/mabadir/blitz-cli/blob/v0.0.0/src/commands/console.ts)_

## `blitz db [FILE]`

describe the command here

```
USAGE
  $ blitz db [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/db.ts](https://github.com/mabadir/blitz-cli/blob/v0.0.0/src/commands/db.ts)_

## `blitz generate [FILE]`

describe the command here

```
USAGE
  $ blitz generate [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/generate.ts](https://github.com/mabadir/blitz-cli/blob/v0.0.0/src/commands/generate.ts)_

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

## `blitz new [FILE]`

Create new Blitz project

```
USAGE
  $ blitz new [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  Directory name
```

_See code: [src/commands/new.ts](https://github.com/mabadir/blitz-cli/blob/v0.0.0/src/commands/new.ts)_

## `blitz run [FILE]`

describe the command here

```
USAGE
  $ blitz run [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/run.ts](https://github.com/mabadir/blitz-cli/blob/v0.0.0/src/commands/run.ts)_

## `blitz start [FILE]`

describe the command here

```
USAGE
  $ blitz start [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/start.ts](https://github.com/mabadir/blitz-cli/blob/v0.0.0/src/commands/start.ts)_

<!-- commandsstop -->
