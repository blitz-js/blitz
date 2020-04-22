import {apiPathTransformer} from '.'

describe('createPagesPathTransformer', () => {
  const tests = [
    {
      name: 'extracts paths folder to the root in a basic transformation',
      input: 'app/users/api/one/two/three.tsx',
      expected: 'pages/api/one/two/three.tsx',
    },
    {
      name: 'handles leading /',
      input: '/app/users/api/one/two/three.tsx',
      expected: 'pages/api/one/two/three.tsx',
    },
    {
      name: 'handles nested api folders',
      input: 'app/users/api/one/two/api/three.tsx',
      expected: 'pages/api/one/two/api/three.tsx',
    },
    {
      name: 'ignores files outside of app',
      input: 'thing/users/api/one/two/pages/three.tsx',
      expected: 'thing/users/api/one/two/pages/three.tsx',
    },
    {
      name: 'Ignore absolute paths',
      input: '/User/foo/bar/app/users/api/one/two/three.tsx',
      expected: 'pages/api/one/two/three.tsx',
    },
  ]

  tests.forEach(({name, input, expected}) => {
    it(name, () => {
      expect(apiPathTransformer(input)).toEqual(expected)
    })
  })
})
