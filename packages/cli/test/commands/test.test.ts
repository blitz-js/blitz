import crossSpawn from 'cross-spawn'
import hasYarn from 'has-yarn'
import TestCmd from '../../src/commands/test'

jest.mock('cross-spawn')
jest.mock('has-yarn')

const testParams = [['test'], {stdio: 'inherit'}]
const testWatchParams = [['test:watch'], {stdio: 'inherit'}]

describe('Test command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('runs yarn test script', async () => {
    jest.spyOn(hasYarn, 'default').mockReturnValue(true)

    await TestCmd.run([])

    expect(crossSpawn.spawn).toBeCalledWith('yarn', ...testParams)
  })

  it('runs npm test script', async () => {
    jest.spyOn(hasYarn, 'default').mockReturnValue(false)

    await TestCmd.run([])

    expect(crossSpawn.spawn).toBeCalledWith('npm', ...testParams)
  })

  it('runs yarn test:watch script', async () => {
    jest.spyOn(hasYarn, 'default').mockReturnValue(true)

    await TestCmd.run(['watch'])

    expect(crossSpawn.spawn).toBeCalledWith('yarn', ...testWatchParams)
  })

  it('runs yarn test:watch script with alias', async () => {
    jest.spyOn(hasYarn, 'default').mockReturnValue(true)

    await TestCmd.run(['w'])

    expect(crossSpawn.spawn).toBeCalledWith('yarn', ...testWatchParams)
  })

  it('runs yarn test and ignores invalid argument', async () => {
    jest.spyOn(hasYarn, 'default').mockReturnValue(true)

    await TestCmd.run(['invalid'])

    expect(crossSpawn.spawn).toBeCalledWith('yarn', ...testParams)
  })
})
