import {createStageRelative} from "."
import {mockStageArgs} from "../stage-test-utils"
import File from "vinyl"
import {testStreamItems} from "../stage-test-utils"
import {normalize} from "path"
describe("relative", () => {
  test("test relative stream", async () => {
    const expected = [
      {
        path: normalize("/projects/blitz/blitz/app/users/pages.ts"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "app/thing/bar"
import from 'app/thing/bar'
import 'app/thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/foo.jpeg"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/bar.tsx"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "app/thing/bar"
import from 'app/thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/baz.js"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "app/thing/bar"
import from 'app/thing/bar'`,
      },
    ]

    const files = [
      {
        path: normalize("/projects/blitz/blitz/app/users/pages.ts"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'
import '../thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/foo.jpeg"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/bar.tsx"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/baz.js"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'`,
      },
    ]
    const {stream} = createStageRelative(mockStageArgs({cwd: normalize("/projects/blitz/blitz")}))

    files.forEach(({path, contents}) => {
      stream.write(new File({path, contents: Buffer.from(contents)}))
    })

    await testStreamItems(stream, expected, ({path, contents}: File) => ({
      path,
      contents: contents?.toString() || "",
    }))
  })
})
