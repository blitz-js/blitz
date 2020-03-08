let onSpy: jest.Mock;
const spawn = jest.fn(() => {
  onSpy = jest.fn(function on(_: string, callback: (_:number) => {}) {
    callback(0);
  });
  return { on: onSpy };
});

jest.doMock('child_process', () => ({spawn}))

import StartCmd from '../../src/commands/start'

describe('Start command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('runs next dev', async () => {
    await StartCmd.run([]);

    expect(spawn).toHaveBeenCalledWith('next', ['dev'], {stdio: 'inherit'})
  })

  it('runs next build && next start', async () => {
    await StartCmd.run(['--production']);

    expect(spawn).toBeCalledWith('next', ['build'], {stdio: 'inherit'})
    expect(spawn.mock.calls.length).toBe(2);

    // following expection is not working
    //expect(onSpy).toHaveBeenCalledWith(0);
    
    expect(spawn).toBeCalledWith('next', ['start'], {stdio: 'inherit'})
    
  })
})
