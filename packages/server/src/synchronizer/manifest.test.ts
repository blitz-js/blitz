import {Manifest} from './manifest'

describe('Manifest', () => {
  it('should be work', () => {
    const m = Manifest.create()

    m.setEntry('one', 'foo/one')
    m.setEntry('two', 'foo/thing/two')
    m.setEntry('three/four', 'foo/three/four')

    expect(m.toObject()).toEqual({
      values: {
        'foo/one': 'one',
        'foo/thing/two': 'two',
        'foo/three/four': 'three/four',
      },
      keys: {
        one: 'foo/one',
        'three/four': 'foo/three/four',
        two: 'foo/thing/two',
      },
    })
    expect(m.getByKey('one')).toBe('foo/one')

    m.removeKey('one')

    expect(m.getByKey('one')).toBe(undefined)
    expect(m.toObject()).toEqual({
      values: {
        'foo/thing/two': 'two',
        'foo/three/four': 'three/four',
      },
      keys: {
        'three/four': 'foo/three/four',
        two: 'foo/thing/two',
      },
    })
    expect(m.getEvents()).toEqual(['set:foo/one', 'set:foo/thing/two', 'set:foo/three/four', 'del:one'])
  })
})
