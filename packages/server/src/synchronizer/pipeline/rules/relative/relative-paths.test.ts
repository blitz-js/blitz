import {relativeToAbsolute, replaceRelativeImports} from './index'
import {normalize} from 'path'

describe('relativeToAbsolute', () => {
  const tests = [
    {
      name: 'Provides an absolute path within app',
      input: {
        relativeImport: normalize('../components/three'),
        filename: normalize('/projects/blitz/blitz/app/users/pages.ts'),
      },
      expected: normalize('app/components/three'),
    },
    {
      name: 'Works outside app',
      input: {
        relativeImport: normalize('../../extras/foo'),
        filename: normalize('/projects/blitz/blitz/app/users/pages.ts'),
      },
      expected: normalize('extras/foo'),
    },
    {
      name: 'Leaves absolute paths alone',
      input: {
        relativeImport: normalize('app/one/two'),
        filename: normalize('/projects/blitz/blitz/app/users/pages.ts'),
      },
      expected: normalize('app/one/two'),
    },
  ]
  tests.forEach(({name, input: {filename, relativeImport}, expected}) => {
    it(name, () => {
      expect(relativeToAbsolute(normalize('/projects/blitz/blitz'), filename)(relativeImport)).toEqual(
        expected,
      )
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
