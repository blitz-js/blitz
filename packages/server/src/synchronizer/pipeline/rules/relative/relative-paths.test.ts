import {relativeToAbsolute, replaceRelativeImports} from './index'

// I don't like this one bit, but Node's path module behaves so differently
// based on the runtime platform that it's just easier to test paths as they
// would be on the platform currently executing the test suite. Tests should
// be run on both platforms, so both test paths will be executed - just not
// during the same run.
const platformSensitiveAbsolutePath = (p: string) =>
  process.platform === 'win32' ? 'C:' + p.split('/').join('\\') : p

describe('relativeToAbsolute', () => {
  const tests = [
    {
      name: 'Provides an absolute path within app',
      input: {
        relativeImport: '../components/three',
        filename: platformSensitiveAbsolutePath('/projects/blitz/blitz/app/users/pages.ts'),
        cwd: platformSensitiveAbsolutePath('/projects/blitz/blitz'),
      },
      expected: 'app/components/three',
    },
    {
      name: 'Works outside app',
      input: {
        relativeImport: '../../extras/foo',
        filename: platformSensitiveAbsolutePath('/projects/blitz/blitz/app/users/pages.ts'),
        cwd: platformSensitiveAbsolutePath('/projects/blitz/blitz'),
      },
      expected: 'extras/foo',
    },
    {
      name: 'Leaves absolute paths alone',
      input: {
        relativeImport: 'app/one/two',
        filename: platformSensitiveAbsolutePath('/projects/blitz/blitz/app/users/pages.ts'),
        cwd: platformSensitiveAbsolutePath('/projects/blitz/blitz'),
      },
      expected: 'app/one/two',
    },
  ]

  tests.forEach(({name, input: {cwd, filename, relativeImport}, expected}) => {
    it(name, () => {
      expect(relativeToAbsolute(cwd, filename)(relativeImport)).toEqual(expected)
    })
  })
})

describe('replaceRelativeImports', () => {
  it('should replace all relativeImports', () => {
    const input = `import {getFoo} from 'app/foo/bar';    
import from "../thing/bar"
import from '../thing/bar'`
    const expected = `import {getFoo} from 'app/foo/bar';    
import from "Hello"
import from 'Hello'`
    expect(replaceRelativeImports(input, (_s: string) => 'Hello')).toBe(expected)
  })
})
