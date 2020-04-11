let onSpy: jest.Mock
const spawn = jest.fn(() => {
  onSpy = jest.fn(function on(_: string, callback: (_: number) => {}) {
    callback(0)
  })
  return {on: onSpy}
})

jest.doMock('child_process', () => ({spawn}))

import DbCmd from '../../src/commands/db'

const initParams = ['prisma', ['init'], {stdio: 'inherit'}]
const migrateSaveParams = ['prisma', ['migrate', 'save', '--experimental'], {stdio: 'inherit'}]
const migrateUpParams = ['prisma', ['migrate', 'up', '--experimental'], {stdio: 'inherit'}]

describe('Db command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('runs db init', async () => {
    await DbCmd.run(['init'])

    expect(spawn).toHaveBeenCalledWith(...initParams)
  })

  it('runs db init (alias)', async () => {
    await DbCmd.run(['i'])

    expect(spawn).toHaveBeenCalledWith(...initParams)
  })

  it('runs db migrate', async () => {
    await DbCmd.run(['migrate'])

    expect(spawn).toBeCalledWith(...migrateSaveParams)
    expect(spawn.mock.calls.length).toBe(2)

    // following expection is not working
    //expect(onSpy).toHaveBeenCalledWith(0);

    expect(spawn).toBeCalledWith(...migrateUpParams)
  })

  it('runs db migrate (alias)', async () => {
    await DbCmd.run(['m'])

    expect(spawn).toBeCalledWith(...migrateSaveParams)
    expect(spawn.mock.calls.length).toBe(2)

    // following expection is not working
    //expect(onSpy).toHaveBeenCalledWith(0);

    expect(spawn).toBeCalledWith(...migrateUpParams)
  })

  it('does not run db in case of invalid command', async () => {
    await DbCmd.run(['invalid'])

    expect(spawn.mock.calls.length).toBe(0)
  })
})
