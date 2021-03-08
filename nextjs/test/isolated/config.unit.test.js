/* eslint-env jest */

import { join } from 'path'
import loadConfig from 'next/dist/next-server/server/config'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'

const pathToConfig = join(__dirname, '_resolvedata', 'without-function')
const pathToConfigFn = join(__dirname, '_resolvedata', 'with-function')

describe('config', () => {
  it('Should get the configuration', () => {
    const config = loadConfig(PHASE_DEVELOPMENT_SERVER, pathToConfig)
    expect(config.customConfig).toBe(true)
  })

  it('Should pass the phase correctly', () => {
    const config = loadConfig(PHASE_DEVELOPMENT_SERVER, pathToConfigFn)
    expect(config.phase).toBe(PHASE_DEVELOPMENT_SERVER)
  })

  it('Should pass the defaultConfig correctly', () => {
    const config = loadConfig(PHASE_DEVELOPMENT_SERVER, pathToConfigFn)
    expect(config.defaultConfig).toBeDefined()
  })

  it('Should assign object defaults deeply to user config', () => {
    const config = loadConfig(PHASE_DEVELOPMENT_SERVER, pathToConfigFn)
    expect(config.distDir).toEqual('.next')
    expect(config.onDemandEntries.maxInactiveAge).toBeDefined()
  })

  it('Should pass the customConfig correctly', () => {
    const config = loadConfig(PHASE_DEVELOPMENT_SERVER, null, {
      customConfig: true,
    })
    expect(config.customConfig).toBe(true)
  })

  it('Should not pass the customConfig when it is null', () => {
    const config = loadConfig(PHASE_DEVELOPMENT_SERVER, null, null)
    expect(config.webpack).toBe(null)
  })

  it('Should assign object defaults deeply to customConfig', () => {
    const config = loadConfig(PHASE_DEVELOPMENT_SERVER, null, {
      customConfig: true,
      onDemandEntries: { custom: true },
    })
    expect(config.customConfig).toBe(true)
    expect(config.onDemandEntries.maxInactiveAge).toBeDefined()
  })

  it('Should allow setting objects which do not have defaults', () => {
    const config = loadConfig(PHASE_DEVELOPMENT_SERVER, null, {
      bogusSetting: { custom: true },
    })
    expect(config.bogusSetting).toBeDefined()
    expect(config.bogusSetting.custom).toBe(true)
  })

  it('Should override defaults for arrays from user arrays', () => {
    const config = loadConfig(PHASE_DEVELOPMENT_SERVER, null, {
      pageExtensions: ['.bogus'],
    })
    expect(config.pageExtensions).toEqual(['.bogus'])
  })

  it('Should throw when an invalid target is provided', () => {
    expect(() => {
      loadConfig(
        PHASE_DEVELOPMENT_SERVER,
        join(__dirname, '_resolvedata', 'invalid-target')
      )
    }).toThrow(/Specified target is invalid/)
  })

  it('Should pass when a valid target is provided', () => {
    const config = loadConfig(
      PHASE_DEVELOPMENT_SERVER,
      join(__dirname, '_resolvedata', 'valid-target')
    )
    expect(config.target).toBe('serverless')
  })

  it('Should throw an error when next.config.js is not present', () => {
    expect(() =>
      loadConfig(
        PHASE_DEVELOPMENT_SERVER,
        join(__dirname, '_resolvedata', 'typescript-config')
      )
    ).toThrow(
      /Configuring Next.js via .+ is not supported. Please replace the file with 'next.config.js'/
    )
  })

  it('Should not throw an error when two versions of next.config.js are present', () => {
    const config = loadConfig(
      PHASE_DEVELOPMENT_SERVER,
      join(__dirname, '_resolvedata', 'js-ts-config')
    )
    expect(config.__test__ext).toBe('js')
  })

  it('Should ignore configs set to `undefined`', () => {
    const config = loadConfig(PHASE_DEVELOPMENT_SERVER, null, {
      target: undefined,
    })
    expect(config.target).toBe('server')
  })

  it('Should ignore configs set to `null`', () => {
    const config = loadConfig(PHASE_DEVELOPMENT_SERVER, null, {
      target: null,
    })
    expect(config.target).toBe('server')
  })
})
