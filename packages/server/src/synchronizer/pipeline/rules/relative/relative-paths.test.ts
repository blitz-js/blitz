import {relativeToAbsolute, replaceRelativeImports} from './index'

describe('relativeToAbsolute', () => {
  const tests = [
    {
      name: 'Provides an absolute path within app',
      input: {
        relativeImport: '../components/three',
        filename: '/projects/blitz/blitz/app/users/pages.ts',
      },
      expected: 'app/components/three',
    },
    {
      name: 'Works outside app',
      input: {
        relativeImport: '../../extras/foo',
        filename: '/projects/blitz/blitz/app/users/pages.ts',
      },
      expected: 'extras/foo',
    },
    {
      name: 'Leaves absolute paths alone',
      input: {
        relativeImport: 'app/one/two',
        filename: '/projects/blitz/blitz/app/users/pages.ts',
      },
      expected: 'app/one/two',
    },
  ]
  tests.forEach(({name, input: {filename, relativeImport}, expected}) => {
    it(name, () => {
      expect(relativeToAbsolute('/projects/blitz/blitz', filename)(relativeImport)).toEqual(expected)
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
