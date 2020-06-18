# Future thinking - work-optimizer

So one future issue we have been trying to account for here is how to solve the dirty sync problem with streams. Basically, we want Blitz to do as little work as possible. At this point, we are blowing away Blitz folders when we start but it would be smarter to analyze the source and destination folders and only manipulate the files that are actually required to be changed. This is not required as of now but will be a consideration as we try and get this thing faster and faster to live up to its name. To prepare for this we have setup a work optimizer that checks the hash of the input file and guards against new work being done

The following is a rough plan for how to do this. (Likely to change/improve at a later point)

- Encode vinyl files + stats

```ts
const hash = crypto
  .createHash("md5")
  .update(file.path + file.stats.mtime)
  .digest("hex")

file.hash = hash
```

- Use those hashes to index file details in the following structures:

Following

```ts
// reduced to as the first step during input
const input = {abc123def456: "/foo/bar/baz", def456abc123: "/foo/bar/bop"}

// reduced to as the last step just before file write
const complete = {
  abc123def456: {
    input: "/foo/bar/baz",
    output: ["/bas/boop/blop", "/bas/boop/ding", "/bas/boop/bar"],
  },
  def456abc123: {
    input: "/foo/bar/bing",
    output: ["/bas/boop/ping", "/bas/boop/foo", "/bas/boop/fawn"],
  },
  cbd123aef456: {
    input: "/foo/bar/bop",
    output: ["/bas/boop/thing"],
  },
}
```

Has this file hash been processed?

```ts
const hash => !!output[hash];
```

Which files do I need to delete based on input?

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
