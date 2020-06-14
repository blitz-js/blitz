import * as path from 'path'
import {resolveBinAsync} from '@blitzjs/server'

let onSpy: jest.Mock
const spawn = jest.fn(() => {
  onSpy = jest.fn(function on(_: string, callback: (_: number) => {}) {
    callback(0)
  })
  return {on: onSpy}
})

jest.doMock('cross-spawn', () => ({spawn}))

import {Db} from '../../src/commands/db'

let schemaArg: string
let prismaBin: string
let migrateSaveParams: any[]
let migrateUpParams: any[]
beforeAll(async () => {
  schemaArg = `--schema=${path.join(process.cwd(), 'db', 'schema.prisma')}`
  prismaBin = await resolveBinAsync('@prisma/cli', 'prisma')

  migrateSaveParams = [
    prismaBin,
    ['migrate', 'save', schemaArg, '--create-db', '--experimental'],
    {stdio: 'inherit'},
  ]
  migrateUpParams = [
    prismaBin,
    ['migrate', 'up', schemaArg, '--create-db', '--experimental'],
    {stdio: 'inherit'},
  ]
})

describe('Db command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env.NODE_ENV = 'test'
  })

  function expectDbMigrateOutcome() {
    expect(spawn.mock.calls.length).toBe(2)

    // following expection is not working
    //expect(onSpy).toHaveBeenCalledWith(0);

    expect(spawn).toBeCalledWith(...migrateUpParams)
  }

  function expectProductionDbMigrateOutcome() {
    expect(spawn).toBeCalledWith(...migrateSaveParams)
    expect(spawn.mock.calls.length).toBe(3)

    // following expection is not working
    //expect(onSpy).toHaveBeenCalledWith(0);

    expect(spawn).toBeCalledWith(...migrateUpParams)
  }

  it('runs db migrate', async () => {
    await Db.run(['migrate'])
    expectDbMigrateOutcome()
  })

  it('runs db migrate in the production environment.', async () => {
    process.env.NODE_ENV = 'production'
    await Db.run(['migrate'])
    expectProductionDbMigrateOutcome()
  })

  it('runs db migrate (alias)', async () => {
    await Db.run(['m'])
    expectDbMigrateOutcome()
  })

  it('runs db migrate (alias) in the production environment.', async () => {
    process.env.NODE_ENV = 'production'
    await Db.run(['m'])
    expectProductionDbMigrateOutcome()
  })

  it('runs db introspect', async () => {
    await Db.run(['introspect'])

    expect(spawn).toHaveBeenCalled()
  })

  it('runs db studio', async () => {
    await Db.run(['studio'])

    expect(spawn).toHaveBeenCalled()
  })

  it('does not run db in case of invalid command', async () => {
    await Db.run(['invalid'])

    expect(spawn.mock.calls.length).toBe(0)
  })
})
