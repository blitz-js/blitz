import {apiResolver} from 'next/dist/next-server/server/api-utils'
import http from 'http'
import listen from 'test-listen'
import fetch from 'isomorphic-unfetch'

import {BlitzApiRequest, BlitzApiResponse} from '@blitzjs/core'
// import {runMiddleware, Middleware} from '.'
//
// const customMiddleware: Middleware = async (req, res, next) => {
//   res.blitzCtx.referrer = req.headers.referer
//
//   await next()
//
//   console.log('Query result:', res.blitzResult)
// }

const apiEndpoint = (_req: BlitzApiRequest, res: BlitzApiResponse) => {
  res.status(201).end()
}

describe('runMiddleware', () => {
  it('works', async () => {
    // await runMiddleware(req, res, customMiddleware)

    await mockServer(apiEndpoint, async (url) => {
      const res = await fetch(url, {
        method: 'POST',
      })

      expect(res.status).toBe(201)
      // expect(data.error.message).toBe('Request body is missing the `params` key')
    })
  })
})

async function mockServer(resolver: any, callback: (url: string) => Promise<void>) {
  let server = http.createServer((req, res) =>
    apiResolver(req, res, null, resolver, {
      previewModeId: 'previewModeId',
      previewModeEncryptionKey: 'previewModeEncryptionKey',
      previewModeSigningKey: 'previewModeSigningKey',
    }),
  )

  try {
    let url = await listen(server)

    await callback(url)
  } finally {
    server.close()
  }
}
