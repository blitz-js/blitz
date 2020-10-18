import {createStageConfig} from "../../src/stages/config"
import {through, transformFiles} from "@blitzjs/file-pipeline"
import {mockFs} from "../utils/multi-mock"
import path from "path"
import {directoryTree} from "../utils/tree-utils"

describe("config stage", () => {
  const processNewFile = () => {}
  const processNewChildFile = () => {}
  const getInputCache = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("throws an error when `next.config.js` exists", () => {
    mockFs({
      "src/next.config.js": "",
    })

    const input = through.obj()
    const bus = through.obj()

    expect(() => {
      createStageConfig({
        config: {
          src: "src",
          cwd: "src",
          dest: "dest",
          include: [],
          ignore: [],
          watch: false,
        },
        processNewFile,
        processNewChildFile,
        input,
        bus,
        getInputCache,
      })
    }).toThrowErrorMatchingInlineSnapshot(
      `"Blitz does not support next.config.js. Please rename your next.config.js to blitz.config.js"`,
    )
  })

  it("throws an error when `blitz.config.js` and `blitz.config.ts` both exist", () => {
    mockFs({
      "src/blitz.config.js": "",
      "src/blitz.config.ts": "",
    })

    const input = through.obj()
    const bus = through.obj()

    expect(() => {
      createStageConfig({
        config: {
          src: "src",
          cwd: "src",
          dest: "dest",
          include: [],
          ignore: [],
          watch: false,
        },
        processNewFile,
        processNewChildFile,
        input,
        bus,
        getInputCache,
      })
    }).toThrowErrorMatchingInlineSnapshot(
      `"Blitz has found blitz.config.js and blitz.config.ts. Please delete one of these configuration files."`,
    )
  })

  it("transpiles the `blitz.config.ts` file", async () => {
    const nodeModulesDir = path.resolve(__dirname, "../../../../node_modules")

    mockFs({
      "src/blitz.config.ts": `export default {}`,
      "src/tsconfig.json": `{
  "compilerOptions": {
    "target": "es5",
    "module": "esnext",
  },
  "exclude": ["node_modules"],
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"]
}`,
      [nodeModulesDir]: mockFs.load(nodeModulesDir),
    })

    const options = {
      watch: false,
      ignore: [],
      include: ["**/*"],
    }
    await transformFiles("src", [createStageConfig], "dest", options)

    expect(directoryTree("dest")).toMatchInlineSnapshot(`
      Object {
        "children": Array [
          Object {
            "name": ".blitz.incache.json",
          },
          Object {
            "name": "blitz.config.js",
          },
          Object {
            "name": "next.config.js",
          },
          Object {
            "name": "tsconfig.json",
          },
        ],
        "name": "dest",
      }
    `)
  }, 20000)
})
