import {createPathTransformer} from './transform-page'

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
      expected: 'pages/one/two/three.tsx',
    },
    {
      folderName: 'routes',
      name: 'extracts paths folder to the root in a basic transformation',
      input: '/User/foo/bar/app/users/routes/one/two/three.tsx',
      expected: 'pages/one/two/three.tsx',
    },
    {
      folderName: ['routes', 'pages'],
      name: 'Array folderNames',
      input: 'app/users/routes/one/two/three.tsx',
      expected: 'pages/one/two/three.tsx',
    },
    {
      folderName: ['routes', 'pages'],
      name: 'Array folder names with nested pages folder',
      input: 'app/users/routes/one/pages/two/three.tsx',
      expected: 'pages/one/pages/two/three.tsx',
    },
    {
      folderName: ['routes', 'pages'],
      name: 'Array folder names with nested routes folder',
      input: 'app/users/routes/one/routes/two/three.tsx',
      expected: 'pages/one/routes/two/three.tsx',
    },
  ]

  tests.forEach(({name, input, expected, folderName = 'pages'}) => {
    it(name, () => {
      const transformer = createPathTransformer({
        appFolder: 'app',
        folderName,
      })
      expect(transformer(input)).toEqual(expected)
    })
  })
})
