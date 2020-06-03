import {fullTransformer, findDuplicates, filterBy} from '.'

test('should filter by path', () => {
  expect(fullTransformer('app/foo/pages/api/bar')).toBe('pages/api/bar')
  expect(fullTransformer('app/foo/api/bar')).toBe('pages/api/bar')

  const dupes = findDuplicates(
    ['app/foo/pages/api/bar', 'app/pages/api/bar', 'app/api/bar', 'pages/bar', 'app/ding/pages/bar'],
    fullTransformer,
  )

  expect(dupes).toEqual([
    ['app/foo/pages/api/bar', 'app/pages/api/bar', 'app/api/bar'],
    ['pages/bar', 'app/ding/pages/bar'],
  ])
  expect(filterBy(dupes, 'api')).toEqual([['app/foo/pages/api/bar', 'app/pages/api/bar', 'app/api/bar']])
  expect(filterBy(dupes, 'pages', 'api')).toEqual([['pages/bar', 'app/ding/pages/bar']])
})

test('filterBy', () => {
  expect(
    filterBy(
      [
        ['foo', 'bar', 'baz'],
        ['boo', 'bar', 'boo'],
      ],
      'foo',
    ),
  ).toEqual([['foo', 'bar', 'baz']])

  expect(
    filterBy(
      [
        ['foo', 'bar', 'api', 'baz'],
        ['boo', 'bar', 'boo'],
      ],
      'foo',
      'api',
    ),
  ).toEqual([])

  expect(
    filterBy(
      [
        ['foo', 'bar', 'baz'],
        ['boo', 'bar', 'boo'],
      ],
      'bar',
    ),
  ).toEqual([
    ['foo', 'bar', 'baz'],
    ['boo', 'bar', 'boo'],
  ])

  expect(
    filterBy(
      [
        ['foo', 'bar', 'baz'],
        ['boo', 'foo', 'boo'],
      ],
      'boo',
    ),
  ).toEqual([['boo', 'foo', 'boo']])

  expect(
    filterBy(
      [
        ['foo', 'bar', 'baz'],
        ['boo', 'foo', 'boo'],
      ],
      'bozo',
    ),
  ).toEqual([])
})
