import {fullTransformer, findDuplicates, filterBy} from '.'
import {normalize} from 'path'

test('should filter by path', () => {
  expect(fullTransformer(normalize('app/foo/pages/api/bar'))).toBe(normalize('pages/api/bar'))
  expect(fullTransformer(normalize('app/foo/api/bar'))).toBe(normalize('pages/api/bar'))

  const dupes = findDuplicates(
    [
      normalize('app/foo/pages/api/bar'),
      normalize('app/pages/api/bar'),
      normalize('app/api/bar'),
      normalize('pages/bar'),
      normalize('app/ding/pages/bar'),
    ],
    fullTransformer,
  )

  expect(dupes).toEqual([
    [normalize('app/foo/pages/api/bar'), normalize('app/pages/api/bar'), normalize('app/api/bar')],
    [normalize('pages/bar'), normalize('app/ding/pages/bar')],
  ])
  expect(filterBy(dupes, 'api')).toEqual([
    [normalize('app/foo/pages/api/bar'), normalize('app/pages/api/bar'), normalize('app/api/bar')],
  ])
  expect(filterBy(dupes, 'pages', 'api')).toEqual([[normalize('pages/bar'), normalize('app/ding/pages/bar')]])
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
