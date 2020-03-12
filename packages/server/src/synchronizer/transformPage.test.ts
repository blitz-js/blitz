import {createPathTransformer} from './transformPage'

describe('page transformer path', () => {
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
      folderName: 'routes',
      name: 'extracts paths folder to the root in a basic transformation',
      input: 'app/users/routes/one/two/three.tsx',
      expected: 'routes/one/two/three.tsx',
    },
    {
      sourceFolder: '/User/foo/bar',
      name: 'extracts paths folder to the root in a basic transformation',
      input: 'app/users/routes/one/two/three.tsx',
      expected: 'routes/one/two/three.tsx',
    },
  ]

  tests.forEach(({name, input, expected, sourceFolder = '', folderName = 'pages'}) => {
    it(name, () => {
      const transformer = createPathTransformer({
        appFolder: 'app',
        folderName,
        sourceFolder,
      })
      expect(transformer(input)).toEqual(expected)
    })
  })
})
