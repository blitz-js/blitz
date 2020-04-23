import {normalize} from 'path'
import {apiPathTransformer} from '.'

describe('createPagesPathTransformer', () => {
  const tests = [
    {
      name: 'extracts paths folder to the root in a basic transformation',
      input: normalize('app/users/api/one/two/three.tsx'),
      expected: normalize('pages/api/one/two/three.tsx'),
    },
    {
      name: 'handles leading /',
      input: normalize('/app/users/api/one/two/three.tsx'),
      expected: normalize('pages/api/one/two/three.tsx'),
    },
    {
      name: 'handles nested api folders',
      input: normalize('app/users/api/one/two/api/three.tsx'),
      expected: normalize('pages/api/one/two/api/three.tsx'),
    },
    {
      name: 'ignores files outside of app',
      input: normalize('thing/users/api/one/two/pages/three.tsx'),
      expected: normalize('thing/users/api/one/two/pages/three.tsx'),
    },
    {
      name: 'Ignore absolute paths',
      input: normalize('/User/foo/bar/app/users/api/one/two/three.tsx'),
      expected: normalize('pages/api/one/two/three.tsx'),
    },
  ]

  tests.forEach(({name, input, expected}) => {
    it(name, () => {
      expect(apiPathTransformer(input)).toEqual(expected)
    })
  })
})
