import {createStageConfig} from "../../src/stages/config"
import {through} from "@blitzjs/file-pipeline"
import {mockFs} from "../utils/multi-mock"

describe("config stage", () => {
  const processNewFile = jest.fn()
  const processNewChildFile = jest.fn()
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

  it.todo("it creates a default config when one doesn't exist", () => {})

  it.todo("it transpiles the `blitz.config.ts` file", () => {})
})
