# Synchronizer Refactor

Design goals

- Rules: Related logic needs to live together
- Everything is a rule
- Efficiency
- Paralell processing
- Cleaner Architecture for Dirty restart functionality
- Agnostic input file watcher / glob
- Simplify tests (Later PR)

# Node stream based

https://www.freecodecamp.org/news/rxjs-and-node-8f4e0acebc7c/
Need to use streams for speed paralellisation and to keep memory footprint low also allows us to utilise gulp api to manage stream logic.

Helper Libs

- Pipe - [pump](https://npmjs.com/package/pump)
- Pipeline - [pumpify](https://npmjs.com/package/pumpify)
- Through - [through2](https://npmjs.com/package/through2)
- Concat - [concat-stream](https://npmjs.com/package/concat-stream)
- Parallel - [parallel-transform](https://npmjs.com/package/parallel-transform)
- Node Compat - [readable-stream](https://npmjs.com/package/readable-stream)

# Rules |

Rules will be of the format:

```ts
type RuleArgs = {
  // Config object passed in to pipeline
  config: {
    src: string
    dest: string
    cwd: string
    manifest: {
      path: string
      write: boolean
    }
  }

  // Errors stream to push errors to so they are displayed nicely
  errors: Transform

  // Pipeline input stream to push new files to
  input: Transform

  // Returns the input cache for analytical in stream processes
  getInputCache(): FileCache
}

type Rule = (
  a: RuleArgs,
) => {
  stream: Transform
}
```

# Evented Vinyl Files

Evented Vinyl Files are vinyl files with events attached to them

```ts
const isDelete = (file) => file.isNull() && file.event === 'unlink'

// The input file at '/path/to/foo' was deleted
// This can be transformed during the process phase
return new Vinyl({
  path: '/path/to/foo',
  content: null,
  event: 'unlink',
})
```

```ts
// Add file at '/path/to/foo'
new Vinyl({
  path: '/path/to/foo',
  content: someContentStream,
})
```

# Input agnostic

Pipeline should be input agnostic ie. it should not matter if it comes from watch or a folder glob

# Input

Input manages inputting of evented vinyl file.
Files that have already been processed or are currently being processed should not be processed again.
Manage a running list of input table indexed by hash

# Analysis

Some types of analysis needs a list of all the files other types do not

Analysis needs to be done in stream as new information comes in. Eg. when someone renames a file that file goes to the analysis engine which works out invariants as they occur without requiring a sweep of the entire file system.

# Rules

Rule streams should take a file and process it

Possible things it can do:

- Change its path or contents
- Drop the file from further processing. Don't copy it.
- Add new files to the input stream - Associating the new files with the original
- Write an error to the error stream

Rules can create a new file to add to the head of the queue

They can hold state in a closure.

They should be managed in a list.

The entire chain can be a list of streams.

```ts
// Rules represent business rules
const rulePages = createRulePages(api)
const ruleRpc = createRuleRpc(api)
const ruleConfig = createRuleConfig(api)
const ruleWrite = createRuleWrite(api)

const stream = pipeline(
  // They can then be used in the pipeline
  input,
  rulePages.stream,
  ruleRpc.stream,
  ruleConfig.stream,
  ruleWrite.stream,
)
```

```ts
import {through} from './streams'

// Typical Rule
export default ({config, input, error, getInputCache}) => {
  const service = createSomeService()

  // This is an incremental file cache that
  // gets built as Files are read
  const cache = getInputCache()

  // Probing sync methods are probably ok here as this is effectively synchronous
  // considered bootstrapping and runs first but you should not write to the file system
  // Use input.write() instead.
  if (!pathExistsSync(resolve(config.src, 'blitz.config.js'))) {
    input.write(resolve(config.src, 'blitz.config.js'), 'Hello World')
  }

  const stream = through.obj(function (file, enc, next) {
    // You can test for changes in the input cache
    if (cache.filter(/next\.config\.js$/.exec).length > -1) {
      const err = new Error('Cannot have next config!')
      err.name = 'NextConfigError'
      errors.write(err)
    }

    // process file in some way
    file.path = file.path.toUpperCase()

    // you can push to the stream output
    this.push(file)

    // send file onwards
    next(null, file)
  })

  return {
    stream,
    service, // provide that service to consumers outside the stream
  }
}
```

# Dirty Sync

Yet to be implemented. This is how we can provide a dirty sync
experience. Eg. stop dev and start again without having to
blow the whole folder away

- Encode vinyl files + stats

```ts
const hash = crypto
  .createHash('md5')
  .update(file.path + file.stats.mtime)
  .digest('hex')

file.hash = hash
```

- Use those hashes to index file details in the following structures:

```ts
// reduced to as the first step during input
const input = {abc123def456: '/foo/bar/baz', def456abc123: '/foo/bar/bop'}

// reduced to as the last step just before file write
const complete = {
  abc123def456: {
    input: '/foo/bar/baz',
    output: ['/bas/boop/blop', '/bas/boop/ding', '/bas/boop/bar'],
  },
  def456abc123: {
    input: '/foo/bar/bing',
    output: ['/bas/boop/ping', '/bas/boop/foo', '/bas/boop/fawn'],
  },
  cbd123aef456: {
    input: '/foo/bar/bop',
    output: ['/bas/boop/thing'],
  },
}
```

Has this file hash been processed?

```ts
const hash => !output[hash];
```

Which files do I still need to delete?

```ts
const deleteHashes = Object.keys(output).filter((hash) => input[hash])
```

- Output can also be indexed by filetype to keep going with our hacky error mapping (eventually this should probably be a sourcemap)

```json
{
  "/bas/boop/bar": "/foo/bar/baz",
  "/bas/boop/blop": "/foo/bar/baz",
  "/bas/boop/ding": "/foo/bar/baz",
  "/bas/boop/fawn": "/foo/bar/bing",
  "/bas/boop/foo": "/foo/bar/bing",
  "/bas/boop/ping": "/foo/bar/bing",
  "/bas/boop/thing": "/foo/bar/bop"
}
```

Does my output match my input ie. am I in a stable state? or in our case can we return the promise.

```ts
function isStable(input, output) {
  if (!input || !output) {
    return // We are not stable if we don't have both an input or output
  }

  const inputKeys = Object.keys(input)
  const outputKeys = Object.keys(output)

  if (inputKeys.length !== outputKeys.length) {
    return false
  }
  match = true
  for (let i = 0; i < inputKeys.length; i++) {
    match = match && outputKey[i] === inputKeys[i]
    if (!match) {
      return false
    }
  }
  return true
}
```
