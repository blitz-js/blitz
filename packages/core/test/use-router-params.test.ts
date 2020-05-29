import {exportRouterParams} from '@blitzjs/core'

describe('useRouterParams', () => {
  describe('exportRouterParams', () => {
    it('returns proper params', () => {
      const routerQuery = {
        id: '1',
        cat: 'category',
        slug: ['example', 'multiple', 'slugs'],
        empty: '',
        queryArray: ['1', '123', ''],
      }

      const query = {
        cat: 'somethingelse',
        slug: ['query-slug'],
        queryArray: ['1', '123', ''],
      }

      const params = exportRouterParams(routerQuery, query)
      expect(params).toEqual({
        id: '1',
        cat: 'category',
        slug: ['example', 'multiple', 'slugs'],
        empty: '',
      })
    })
  })
})
