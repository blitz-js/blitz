import {getDuplicatePaths} from './utils'

describe('getDuplicatePaths', () => {
  it('should find duplicates', () => {
    const entries = [
      '/blar/pool/blob',
      '/blar/pool/blob',
      '/blar/pool/blobs',
      '/blar/poolio/blob',
      '/blar/pool/blobby',
      '/blar/pool/bing/foo',
      '/blar/poolio/blob',
    ]
    expect(getDuplicatePaths(entries, 'pool')).toEqual([
      ['/blar/pool/blob', '/blar/pool/blob'],
      ['/blar/poolio/blob', '/blar/poolio/blob'],
    ])
  })
})
