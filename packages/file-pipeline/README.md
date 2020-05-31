# `file-pipeline`

This package provides a gulp based pipeline for transforming files from a source to a destination across a series of stages.

```ts
import {transformFiles} from '@blitzjs/file-pipeline'
import through from 'through2'
import File from 'vinyl'

// This is an example of a stage that does nothing to the
// files as they pass through the pipeline
const myStage = () => ({
  stream: through.obj((file:File, _, next) => {
    // Normally transformation will take place here
    next(null, file)
  })
})

const mySecondStage = () => ({
  stream: through.obj((file:File, _, next) => {
    // Normally transformation will take place here
    next(null, file)
  })
})

// Files start off at the source
const src = '/path/to/src'
// Pass through the stages one by one
const stages = [
  myStage,
  mySecondStage
]
// Then end up at the destination
const dest = '/path/to/dest'

// We can set various options they are all optional
const options = {
  // This indicates if the file watcher will be turned on
  watch:true,
  // this is a list of source files globs to ignore
  ignore: [],
  // this is a list of source files globs to include
  include: ['**/*']
  // pass in an optional transform stream that will be used as an event bus
  bus: someTransformStream
}

// run the transform
transformFiles(src, stages, dest, options),
```

## Stages

Stages are how you provide special behaviour to your file-pipeline.

The anatomy of your stage looks like this:

```ts
function myStage({
  // Stage config holds the basic info you need for the stage
  config: {
    // src folder
    src,
    // dest folder
    dest,
    // current working directory
    cwd,
    // include globs
    include,
    // ignore globs
    ignore,
    // if we are in watch mode
    watch,
  },
  // Input writable stream - use input.write(file) to send a file the input of the pipeline
  input,
  // Event bus stream - use this to send events to listeners within and outside of the pipeline
  bus,
  // Get the input cache.
  // This is an object that contains cached objects for all the files ingested.
  // Use this for things that require lists of files
  getInputCache,
}: StageArgs) {
  // Create some kind of transform stream
  const stream = createSomeKindOfTransformStream()

  // Ready - is an object that will be merged with all other
  // Stages and returned in a promise by  transformFiles()
  const ready = {foo: 'This will appear in the object returned by transformation promise'}

  // Export the stream and the ready info
  return {stream, ready}
}
```
