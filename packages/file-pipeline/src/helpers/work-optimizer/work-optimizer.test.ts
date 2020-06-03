import {createWorkOptimizer} from '.'
import {testStreamItems} from '../../test-utils'
import {pipeline} from '../../streams'
import File from 'vinyl'

function logItem(fileOrString: {path: string} | string) {
  if (typeof fileOrString === 'string') {
    return fileOrString
  }
  return fileOrString.path
}

describe('agnosticSource', () => {
  test('basic throughput', async () => {
    const {triage, reportComplete} = createWorkOptimizer()
    triage.write(
      new File({
        hash: 'one',
        path: '/path/to/one',
        content: Buffer.from('one'),
      }),
    )

    triage.write(
      new File({
        hash: 'two',
        path: '/path/to/two',
        content: Buffer.from('two'),
      }),
    )

    triage.write(
      new File({
        hash: 'three',
        path: '/path/to/three',
        content: Buffer.from('three'),
      }),
    )

    const expected = ['/path/to/one', '/path/to/two', '/path/to/three']
    const stream = pipeline(triage, reportComplete)
    await testStreamItems(stream, expected, logItem)
  })

  test('same file is rejected', async () => {
    const {triage, reportComplete} = createWorkOptimizer()
    triage.write(
      new File({
        hash: 'one',
        path: '/path/to/one',
        content: Buffer.from('one'),
      }),
    )

    triage.write(
      new File({
        hash: 'one',
        path: '/path/to/one',
        content: Buffer.from('one'),
      }),
    )

    triage.write(
      new File({
        hash: 'two',
        path: '/path/to/two',
        content: Buffer.from('two'),
      }),
    )

    const expected = ['/path/to/one', '/path/to/two']
    const stream = pipeline(triage, reportComplete)
    await testStreamItems(stream, expected, logItem)
  })
})
