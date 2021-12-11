import {
  addBabelPlugin,
  addBabelPreset,
  customTsParser,
} from '@blitzjs/installer'
import j from 'jscodeshift'

function executeBabelPlugin(
  fileStr: string,
  plugin: string | [string, Object]
): string {
  return addBabelPlugin(
    j(fileStr, { parser: customTsParser }),
    plugin
  ).toSource()
}

function executeBabelPreset(
  fileStr: string,
  plugin: string | [string, Object]
): string {
  return addBabelPreset(
    j(fileStr, { parser: customTsParser }),
    plugin
  ).toSource()
}

describe('addBabelPlugin transform', () => {
  it('adds babel plugin literal', () => {
    const source = `module.exports = {
      presets: ["@babel/preset-typescript"],
      plugins: [],
    }`

    expect(executeBabelPlugin(source, '@emotion')).toMatchSnapshot()
  })

  it('adds babel plugin array', () => {
    const source = `module.exports = {
      presets: ["@babel/preset-typescript"],
      plugins: [],
    }`

    expect(
      executeBabelPlugin(source, [
        '@babel/plugin-proposal-decorators',
        { legacy: true },
      ])
    ).toMatchSnapshot()
  })

  it('avoid duplicated', () => {
    const source = `module.exports = {
      presets: ["@babel/preset-typescript"],
      plugins: ["@babel/plugin-proposal-decorators"],
    }`

    expect(
      executeBabelPlugin(source, [
        '@babel/plugin-proposal-decorators',
        { legacy: true },
      ])
    ).toMatchSnapshot()
  })
})

describe('addBabelPreset transform', () => {
  it('adds babel preset literal', () => {
    const source = `module.exports = {
      presets: ["@babel/preset-typescript"],
      plugins: [],
    }`

    expect(executeBabelPreset(source, 'blitz/babel')).toMatchSnapshot()
  })

  it('adds babel preset array', () => {
    const source = `module.exports = {
      presets: ["@babel/preset-typescript"],
      plugins: [],
    }`

    expect(
      executeBabelPreset(source, ['blitz/babel', { legacy: true }])
    ).toMatchSnapshot()
  })

  it('avoid duplicated', () => {
    const source = `module.exports = {
      presets: [["blitz/babel", {legacy: true}]],
      plugins: [],
    }`

    expect(executeBabelPreset(source, 'blitz/babel')).toMatchSnapshot()
  })
})
