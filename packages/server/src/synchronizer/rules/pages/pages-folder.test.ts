import {pathTransformer} from '.'

describe('createPagesPathTransformer', () => {
  const tests = [
    {
      name: 'extracts paths folder to the root in a basic transformation',
      input: 'app/users/pages/one/two/three.tsx',
      expected: 'pages/one/two/three.tsx',
    },
    {
      name: 'handles leading /',
      input: '/app/users/pages/one/two/three.tsx',
      expected: 'pages/one/two/three.tsx',
    },
    {
      name: 'handles nested pages folders',
      input: 'app/users/pages/one/two/pages/three.tsx',
      expected: 'pages/one/two/pages/three.tsx',
    },
    {
      name: 'ignores files outside of app',
      input: 'thing/users/pages/one/two/pages/three.tsx',
      expected: 'thing/users/pages/one/two/pages/three.tsx',
    },
    {
      name: 'extracts paths folder to the root in a basic transformation',
      input: 'app/users/pages/one/two/three.tsx',
      expected: 'pages/one/two/three.tsx',
    },
    {
      name: 'extracts paths folder to the root in a basic transformation',
      input: '/User/foo/bar/app/users/pages/one/two/three.tsx',
      expected: 'pages/one/two/three.tsx',
    },
    {
      name: 'Array folderNames',
      input: 'app/users/pages/one/two/three.tsx',
      expected: 'pages/one/two/three.tsx',
    },
  ]

  tests.forEach(({name, input, expected}) => {
    it(name, () => {
      expect(pathTransformer(input)).toEqual(expected)
    })
  })
})
