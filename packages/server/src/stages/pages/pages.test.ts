import {normalize} from 'path'
import {pagesPathTransformer, getNestedApiRoutes} from '.'

describe('createPagesPathTransformer', () => {
  const tests = [
    {
      name: 'extracts paths folder to the root in a basic transformation',
      input: normalize('app/users/pages/one/two/three.tsx'),
      expected: normalize('pages/one/two/three.tsx'),
    },
    {
      name: 'handles leading /',
      input: normalize('/app/users/pages/one/two/three.tsx'),
      expected: normalize('pages/one/two/three.tsx'),
    },
    {
      name: 'handles nested pages folders',
      input: normalize('app/users/pages/one/two/pages/three.tsx'),
      expected: normalize('pages/one/two/pages/three.tsx'),
    },
    {
      name: 'ignores files outside of app',
      input: normalize('thing/users/pages/one/two/pages/three.tsx'),
      expected: normalize('thing/users/pages/one/two/pages/three.tsx'),
    },
    {
      name: 'extracts paths folder to the root in a basic transformation',
      input: normalize('/User/foo/bar/app/users/pages/one/two/three.tsx'),
      expected: normalize('pages/one/two/three.tsx'),
    },
  ]

  tests.forEach(({name, input, expected}) => {
    it(name, () => {
      expect(pagesPathTransformer(input)).toEqual(expected)
    })
  })
})

describe('getNestedApiRoutes', () => {
  it('should identify nested pages/api routes in entries', () => {
    expect(getNestedApiRoutes(['/foo/bar/baz/app/buzz/api/thing'])).toEqual([])
    expect(
      getNestedApiRoutes([
        '/foo/bar/baz/app/pages/buzz/api/thing',
        '/foo/bar/baz/app/buzz/pages/thing',
        '/foo/bar/baz/app/buzz/pages/api/thing',
        '/foo/bar/baz/app/buzz/thing/pages/api/thing',
      ]),
    ).toEqual(['/foo/bar/baz/app/buzz/pages/api/thing', '/foo/bar/baz/app/buzz/thing/pages/api/thing'])

    // Should not warn when /pages/api is not in /app folder
    expect(getNestedApiRoutes(['/foo/bar/baz/pages/api/thing'])).toEqual([])
    expect(getNestedApiRoutes(['app/pages/api/thing'])).toEqual(['app/pages/api/thing'])
    expect(getNestedApiRoutes(['app/pages/thing/api/thing'])).toEqual([])
    expect(getNestedApiRoutes(['/app/pages/api/thing'])).toEqual(['/app/pages/api/thing'])
    expect(getNestedApiRoutes(['bapp/pages/api/thing'])).toEqual([])
  })
})
