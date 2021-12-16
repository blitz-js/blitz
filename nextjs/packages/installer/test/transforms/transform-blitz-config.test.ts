import {
  customTsParser,
  transformBlitzConfig,
  TransformBlitzConfigCallback,
} from '@blitzjs/installer'
import j from 'jscodeshift'
import type { Options as RecastOptions } from 'recast'

const recastOptions: RecastOptions = {
  tabWidth: 2,
  arrayBracketSpacing: false,
  objectCurlySpacing: false,
  quote: 'single',
}

const executeTransform = (
  fileStr: string,
  transform: TransformBlitzConfigCallback
) => transformBlitzConfig(j(fileStr, { parser: customTsParser }), transform)

describe('transformBlitzConfig finds config', () => {
  const CONFIG = `{testProp: 'found'}`

  function findConfig(fileStr: string, equalTo = CONFIG): boolean {
    let config: j.ObjectExpression | undefined = undefined

    executeTransform(fileStr, (configObj) => {
      config = configObj
      return configObj
    })

    const configStr = config ? j(config).toSource(recastOptions) : null

    return configStr === equalTo
  }

  it('simple module.exports', () => {
    const file = `
      module.exports = ${CONFIG}
    `
    expect(findConfig(file)).toBe(true)
  })

  it('different config object as a control', () => {
    const file = `
      module.exports = {other: false}
    `
    expect(findConfig(file)).toBe(false)
  })

  it('simple module.exports', () => {
    const file = `
      module.exports = ${CONFIG}
    `
    expect(findConfig(file)).toBe(true)
  })

  it('inside a variable', () => {
    const file = `
      const config = ${CONFIG}

      module.exports = config
    `
    expect(findConfig(file)).toBe(true)
  })

  it('with a wrapper', () => {
    const file = `
      module.exports = withBundleAnalyzer(${CONFIG})
    `
    expect(findConfig(file)).toBe(true)
  })

  it('with an empty wrapper', () => {
    const file = `
      module.exports = withBundleAnalyzer()
    `
    expect(findConfig(file)).toBe(false)
  })

  it('as a variable inside a wrapper', () => {
    const file = `
      const config = ${CONFIG}
      module.exports = withBundleAnalyzer(config)
    `
    expect(findConfig(file)).toBe(true)
  })

  it('nested wrapper', () => {
    const file = `
      module.exports = wrapper(wrapper(wrapper(${CONFIG})))
    `
    expect(findConfig(file)).toBe(true)
  })

  it('wrapper inside a variable', () => {
    const file = `
      const config = wrapper(${CONFIG})
      module.exports = config
    `
    expect(findConfig(file)).toBe(true)
  })

  it('the very worst case', () => {
    const file = `
      const config1 = wrapper(
        wrapper(${CONFIG}),
        {otherData: true}
      )
      const config2 = wrapper(${CONFIG})
      const config3 = wrapper(wrapper(config2))
      module.exports = wrapper(config3)
    `
    expect(findConfig(file)).toBe(true)
  })

  it('create empty object on empty function', () => {
    const file = `
      module.exports = withBundleAnalyzer()
    `
    expect(findConfig(file, '{}')).toBe(true)
  })
})

describe('transformBlitzConfig transform', () => {
  it('module.exports', () => {
    const file = `module.exports = {}`

    expect(
      executeTransform(file, (config) => {
        config.properties.push(
          j.objectProperty(j.identifier('test'), j.booleanLiteral(true))
        )
        return config
      }).toSource(recastOptions)
    ).toMatchSnapshot()
  })

  it('empty file', () => {
    const file = ''

    expect(
      executeTransform(file, (config) => config).toSource(recastOptions)
    ).toMatchSnapshot()
  })

  it('with wrapper', () => {
    const file = `module.exports = withBundleAnalyzer({})`

    expect(
      executeTransform(file, (config) => config).toSource(recastOptions)
    ).toMatchSnapshot()
  })

  it('with empty wrapper', () => {
    const file = `module.exports = withBundleAnalyzer()`

    expect(
      executeTransform(file, (config) => config).toSource(recastOptions)
    ).toMatchSnapshot()
  })

  it('the config file from examples/auth', () => {
    const file = [
      'import {sessionMiddleware, simpleRolesIsAuthorized} from "blitz"',
      'import db from "db"',
      'const withBundleAnalyzer = require("@next/bundle-analyzer")({',
      '  enabled: process.env.ANALYZE === "true",',
      '})',
      '',
      'module.exports = withBundleAnalyzer({',
      '  middleware: [',
      '    sessionMiddleware({',
      '      cookiePrefix: "blitz-auth-example",',
      '      isAuthorized: simpleRolesIsAuthorized,',
      '      // sessionExpiryMinutes: 4,',
      '      getSession: (handle) => db.session.findFirst({where: {handle}}),',
      '    }),',
      '  ],',
      '  cli: {',
      '    clearConsoleOnBlitzDev: false,',
      '  },',
      '  codegen: {',
      '    templateDir: "my-templates",',
      '  },',
      '  log: {',
      '    // level: "trace",',
      '  },',
      '  experimental: {',
      '    initServer() {',
      '      console.log("Hello world from initServer")',
      '    },',
      '  },',
      '  /*',
      '  webpack: (config, {buildId, dev, isServer, defaultLoaders, webpack}) => {',
      '    // Note: we provide webpack above so you should not `require` it',
      '    // Perform customizations to webpack config',
      '    // Important: return the modified config',
      '    return config',
      '  },',
      '  webpackDevMiddleware: (config) => {',
      '    // Perform customizations to webpack dev middleware config',
      '    // Important: return the modified config',
      '    return config',
      '  },',
      '  */',
      '})',
    ].join('\n')

    expect(
      executeTransform(file, (config) => {
        const cliValue = j.objectExpression([
          j.objectProperty(
            j.identifier('clearConsoleOnBlitzDev'),
            j.booleanLiteral(true)
          ),
        ])

        const cliProp = config.properties.find(
          (value) =>
            value.type === 'ObjectProperty' &&
            value.key.type === 'Identifier' &&
            value.key.name === 'cli'
        ) as j.ObjectProperty | undefined

        if (!cliProp) {
          config.properties.push(
            j.objectProperty(j.identifier('cli'), cliValue)
          )
          return config
        }

        cliProp.value = cliValue

        return config
      }).toSource(recastOptions)
    ).toMatchSnapshot()
  })
})
