import {normalize} from "path"
import File from "vinyl"
import {mockStageArgs} from "../stage-test-utils"
import {testStreamItems} from "../stage-test-utils"
import {createStageRelative} from "."
describe("relative", () => {
  test("test relative stream", async () => {
    const files = [
      {
        path: normalize("/projects/blitz/blitz/app/users/pages/index.ts"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'
import '../thing/bar'
const Component = dynamic(() => import("../thing/bar"), {})`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/pages.ts"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'
import '../thing/bar'
const Component = dynamic(() => import("../thing/bar"), {})`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/foo.jpeg"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/pages/bar.tsx"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../../thing/bar"
import from '../../thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/baz/pages/hey.js"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../../../thing/bar"
import from '../../../thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/baz.js"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/queries/baz.js"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/mutations/baz.js"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/auth/api/auth/foo.js"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../../thing/bar'`,
      },
    ]

    const expected = [
      {
        path: normalize("/projects/blitz/blitz/app/users/pages/index.ts"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "app/users/thing/bar"
import from 'app/users/thing/bar'
import 'app/users/thing/bar'
const Component = dynamic(() => import("app/users/thing/bar"), {})`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/pages.ts"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'
import '../thing/bar'
const Component = dynamic(() => import("../thing/bar"), {})`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/foo.jpeg"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/pages/bar.tsx"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "app/thing/bar"
import from 'app/thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/baz/pages/hey.js"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "app/thing/bar"
import from 'app/thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/users/baz.js"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "../thing/bar"
import from '../thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/queries/baz.js"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "app/thing/bar"
import from 'app/thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/mutations/baz.js"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "app/thing/bar"
import from 'app/thing/bar'`,
      },
      {
        path: normalize("/projects/blitz/blitz/app/auth/api/auth/foo.js"),
        contents: `import {getFoo} from 'app/foo/bar';
import from "app/auth/api/thing/bar"
import from 'app/auth/thing/bar'`,
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
