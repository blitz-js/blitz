/* eslint-env jest */

import http from 'http'
import url from 'url'
import stripAnsi from 'strip-ansi'
import fs from 'fs-extra'
import { join } from 'path'
import cheerio from 'cheerio'
import webdriver from 'next-webdriver'
import {
  launchApp,
  killApp,
  findPort,
  nextBuild,
  nextStart,
  fetchViaHTTP,
  renderViaHTTP,
  getBrowserBodyText,
  waitFor,
  normalizeRegEx,
  initNextServerScript,
  nextExport,
} from 'next-test-utils'

jest.setTimeout(1000 * 60 * 2)

let appDir = join(__dirname, '..')
const nextConfigPath = join(appDir, 'next.config.js')
let externalServerHits = new Set()
let nextConfigRestoreContent
let nextConfigContent
let externalServerPort
let externalServer
let stdout = ''
let stderr = ''
let buildId
let appPort
let app

const runTests = (isDev = false) => {
  it('should parse params correctly for rewrite to auto-export dynamic page', async () => {
    const browser = await webdriver(appPort, '/rewriting-to-auto-export')
    const text = await browser.eval(() => document.documentElement.innerHTML)
    expect(text).toContain('auto-export hello')
  })

  it('should handle one-to-one rewrite successfully', async () => {
    const html = await renderViaHTTP(appPort, '/first')
    expect(html).toMatch(/hello/)
  })

  it('should handle chained rewrites successfully', async () => {
    const html = await renderViaHTTP(appPort, '/')
    expect(html).toMatch(/multi-rewrites/)
  })

  it('should handle param like headers properly', async () => {
    const res = await fetchViaHTTP(appPort, '/my-other-header/my-path')
    expect(res.headers.get('x-path')).toBe('my-path')
    expect(res.headers.get('somemy-path')).toBe('hi')
    expect(res.headers.get('x-test')).toBe('some:value*')
    expect(res.headers.get('x-test-2')).toBe('value*')
    expect(res.headers.get('x-test-3')).toBe(':value?')
    expect(res.headers.get('x-test-4')).toBe(':value+')
    expect(res.headers.get('x-test-5')).toBe('something https:')
    expect(res.headers.get('x-test-6')).toBe(':hello(world)')
    expect(res.headers.get('x-test-7')).toBe('hello(world)')
    expect(res.headers.get('x-test-8')).toBe('hello{1,}')
    expect(res.headers.get('x-test-9')).toBe(':hello{1,2}')
    expect(res.headers.get('content-security-policy')).toBe(
      "default-src 'self'; img-src *; media-src media1.com media2.com; script-src userscripts.example.com/my-path"
    )
  })

  it('should not match dynamic route immediately after applying header', async () => {
    const res = await fetchViaHTTP(appPort, '/blog/post-321')
    expect(res.headers.get('x-something')).toBe('applied-everywhere')

    const $ = cheerio.load(await res.text())
    expect(JSON.parse($('p').text()).path).toBe('blog')
  })

  it('should handle chained redirects successfully', async () => {
    const res1 = await fetchViaHTTP(appPort, '/redir-chain1', undefined, {
      redirect: 'manual',
    })
    const res1location = url.parse(res1.headers.get('location')).pathname
    expect(res1.status).toBe(301)
    expect(res1location).toBe('/redir-chain2')

    const res2 = await fetchViaHTTP(appPort, res1location, undefined, {
      redirect: 'manual',
    })
    const res2location = url.parse(res2.headers.get('location')).pathname
    expect(res2.status).toBe(302)
    expect(res2location).toBe('/redir-chain3')

    const res3 = await fetchViaHTTP(appPort, res2location, undefined, {
      redirect: 'manual',
    })
    const res3location = url.parse(res3.headers.get('location')).pathname
    expect(res3.status).toBe(303)
    expect(res3location).toBe('/')
  })

  it('should redirect successfully with permanent: false', async () => {
    const res = await fetchViaHTTP(appPort, '/redirect1', undefined, {
      redirect: 'manual',
    })
    const { pathname } = url.parse(res.headers.get('location'))
    expect(res.status).toBe(307)
    expect(pathname).toBe('/')
  })

  it('should redirect with params successfully', async () => {
    const res = await fetchViaHTTP(appPort, '/hello/123/another', undefined, {
      redirect: 'manual',
    })
    const { pathname } = url.parse(res.headers.get('location'))
    expect(res.status).toBe(307)
    expect(pathname).toBe('/blog/123')
  })

  it('should redirect with hash successfully', async () => {
    const res = await fetchViaHTTP(
      appPort,
      '/docs/router-status/500',
      undefined,
      {
        redirect: 'manual',
      }
    )
    const { pathname, hash, query } = url.parse(
      res.headers.get('location'),
      true
    )
    expect(res.status).toBe(301)
    expect(pathname).toBe('/docs/v2/network/status-codes')
    expect(hash).toBe('#500')
    expect(query).toEqual({})
  })

  it('should redirect successfully with provided statusCode', async () => {
    const res = await fetchViaHTTP(appPort, '/redirect2', undefined, {
      redirect: 'manual',
    })
    const { pathname, query } = url.parse(res.headers.get('location'), true)
    expect(res.status).toBe(301)
    expect(pathname).toBe('/')
    expect(query).toEqual({})
  })

  it('should redirect successfully with catchall', async () => {
    const res = await fetchViaHTTP(
      appPort,
      '/catchall-redirect/hello/world',
      undefined,
      {
        redirect: 'manual',
      }
    )
    const { pathname, query } = url.parse(res.headers.get('location'), true)
    expect(res.status).toBe(307)
    expect(pathname).toBe('/somewhere')
    expect(query).toEqual({})
  })

  it('should server static files through a rewrite', async () => {
    const text = await renderViaHTTP(appPort, '/hello-world')
    expect(text).toBe('hello world!')
  })

  it('should rewrite with params successfully', async () => {
    const html = await renderViaHTTP(appPort, '/test/hello')
    expect(html).toMatch(/Hello/)
  })

  it('should not append params when one is used in destination path', async () => {
    const html = await renderViaHTTP(appPort, '/test/with-params?a=b')
    const $ = cheerio.load(html)
    expect(JSON.parse($('p').text())).toEqual({ a: 'b' })
  })

  it('should double redirect successfully', async () => {
    const html = await renderViaHTTP(appPort, '/docs/github')
    expect(html).toMatch(/hi there/)
  })

  it('should allow params in query for rewrite', async () => {
    const html = await renderViaHTTP(appPort, '/query-rewrite/hello/world?a=b')
    const $ = cheerio.load(html)
    expect(JSON.parse($('#__NEXT_DATA__').html()).query).toEqual({
      first: 'hello',
      second: 'world',
      a: 'b',
      section: 'hello',
      name: 'world',
    })
  })

  it('should have correct params for catchall rewrite', async () => {
    const html = await renderViaHTTP(
      appPort,
      '/catchall-rewrite/hello/world?a=b'
    )
    const $ = cheerio.load(html)
    expect(JSON.parse($('#__NEXT_DATA__').html()).query).toEqual({
      a: 'b',
      path: ['hello', 'world'],
    })
  })

  it('should have correct encoding for params with catchall rewrite', async () => {
    const html = await renderViaHTTP(
      appPort,
      '/catchall-rewrite/hello%20world%3Fw%3D24%26focalpoint%3Dcenter?a=b'
    )
    const $ = cheerio.load(html)
    expect(JSON.parse($('#__NEXT_DATA__').html()).query).toEqual({
      a: 'b',
      path: ['hello%20world%3Fw%3D24%26focalpoint%3Dcenter'],
    })
  })

  it('should have correct query for catchall rewrite', async () => {
    const html = await renderViaHTTP(appPort, '/catchall-query/hello/world?a=b')
    const $ = cheerio.load(html)
    expect(JSON.parse($('#__NEXT_DATA__').html()).query).toEqual({
      a: 'b',
      another: 'hello/world',
      path: ['hello', 'world'],
    })
  })

  it('should have correct header for catchall rewrite', async () => {
    const res = await fetchViaHTTP(appPort, '/catchall-header/hello/world?a=b')
    const headerValue = res.headers.get('x-value')
    expect(headerValue).toBe('hello/world')
  })

  it('should allow params in query for redirect', async () => {
    const res = await fetchViaHTTP(
      appPort,
      '/query-redirect/hello/world?a=b',
      undefined,
      {
        redirect: 'manual',
      }
    )
    const { pathname, query } = url.parse(res.headers.get('location'), true)
    expect(res.status).toBe(307)
    expect(pathname).toBe('/with-params')
    expect(query).toEqual({
      first: 'hello',
      second: 'world',
      a: 'b',
    })
  })

  it('should have correctly encoded params in query for redirect', async () => {
    const res = await fetchViaHTTP(
      appPort,
      '/query-redirect/hello%20world%3Fw%3D24%26focalpoint%3Dcenter/world?a=b',
      undefined,
      {
        redirect: 'manual',
      }
    )
    const { pathname, query } = url.parse(res.headers.get('location'), true)
    expect(res.status).toBe(307)
    expect(pathname).toBe('/with-params')
    expect(query).toEqual({
      // this should be decoded since url.parse decodes query values
      first: 'hello world?w=24&focalpoint=center',
      second: 'world',
      a: 'b',
    })
  })

  it('should overwrite param values correctly', async () => {
    const html = await renderViaHTTP(appPort, '/test-overwrite/first/second')
    expect(html).toMatch(/this-should-be-the-value/)
    expect(html).not.toMatch(/first/)
    expect(html).toMatch(/second/)
  })

  it('should handle query for rewrite correctly', async () => {
    // query merge order lowest priority to highest
    // 1. initial URL query values
    // 2. path segment values
    // 3. destination specified query values

    const html = await renderViaHTTP(
      appPort,
      '/query-rewrite/first/second?section=overridden&name=overridden&first=overridden&second=overridden&keep=me'
    )

    const data = JSON.parse(cheerio.load(html)('p').text())
    expect(data).toEqual({
      first: 'first',
      second: 'second',
      section: 'first',
      name: 'second',
      keep: 'me',
    })
  })

  // current routes order do not allow rewrites to override page
  // but allow redirects to
  it('should not allow rewrite to override page file', async () => {
    const html = await renderViaHTTP(appPort, '/nav')
    expect(html).toContain('to-hello')
  })

  it('show allow redirect to override the page', async () => {
    const res = await fetchViaHTTP(appPort, '/redirect-override', undefined, {
      redirect: 'manual',
    })
    const { pathname } = url.parse(res.headers.get('location') || '')
    expect(res.status).toBe(307)
    expect(pathname).toBe('/thank-you-next')
  })

  it('should work successfully on the client', async () => {
    const browser = await webdriver(appPort, '/nav')
    await browser.elementByCss('#to-hello').click()
    await browser.waitForElementByCss('#hello')

    expect(await browser.eval('window.location.href')).toMatch(/\/first$/)
    expect(await getBrowserBodyText(browser)).toMatch(/Hello/)

    await browser.eval('window.location.href = window.location.href')
    await waitFor(500)
    expect(await browser.eval('window.location.href')).toMatch(/\/first$/)
    expect(await getBrowserBodyText(browser)).toMatch(/Hello/)

    await browser.elementByCss('#to-nav').click()
    await browser.waitForElementByCss('#to-hello-again')
    await browser.elementByCss('#to-hello-again').click()
    await browser.waitForElementByCss('#hello-again')

    expect(await browser.eval('window.location.href')).toMatch(/\/second$/)
    expect(await getBrowserBodyText(browser)).toMatch(/Hello again/)

    await browser.eval('window.location.href = window.location.href')
    await waitFor(500)
    expect(await browser.eval('window.location.href')).toMatch(/\/second$/)
    expect(await getBrowserBodyText(browser)).toMatch(/Hello again/)
  })

  it('should work with rewrite when manually specifying href/as', async () => {
    const browser = await webdriver(appPort, '/nav')
    await browser.eval('window.beforeNav = 1')
    await browser
      .elementByCss('#to-params-manual')
      .click()
      .waitForElementByCss('#query')

    expect(await browser.eval('window.beforeNav')).toBe(1)
    const query = JSON.parse(await browser.elementByCss('#query').text())
    expect(query).toEqual({
      something: '1',
      another: 'value',
    })
  })

  it('should work with rewrite when only specifying href', async () => {
    const browser = await webdriver(appPort, '/nav')
    await browser.eval('window.beforeNav = 1')
    await browser
      .elementByCss('#to-params')
      .click()
      .waitForElementByCss('#query')

    expect(await browser.eval('window.beforeNav')).toBe(1)
    const query = JSON.parse(await browser.elementByCss('#query').text())
    expect(query).toEqual({
      something: '1',
      another: 'value',
    })
  })

  it('should work with rewrite when only specifying href and ends in dynamic route', async () => {
    const browser = await webdriver(appPort, '/nav')
    await browser.eval('window.beforeNav = 1')
    await browser
      .elementByCss('#to-rewritten-dynamic')
      .click()
      .waitForElementByCss('#auto-export')

    expect(await browser.eval('window.beforeNav')).toBe(1)

    const text = await browser.eval(() => document.documentElement.innerHTML)
    expect(text).toContain('auto-export hello')
  })

  it('should match a page after a rewrite', async () => {
    const html = await renderViaHTTP(appPort, '/to-hello')
    expect(html).toContain('Hello')
  })

  it('should match dynamic route after rewrite', async () => {
    const html = await renderViaHTTP(appPort, '/blog/post-1')
    expect(html).toMatch(/post:.*?post-2/)
  })

  it('should match public file after rewrite', async () => {
    const data = await renderViaHTTP(appPort, '/blog/data.json')
    expect(JSON.parse(data)).toEqual({ hello: 'world' })
  })

  it('should match /_next file after rewrite', async () => {
    await renderViaHTTP(appPort, '/hello')
    const data = await renderViaHTTP(
      appPort,
      `/hidden/_next/static/${buildId}/_buildManifest.js`
    )
    expect(data).toContain('/hello')
  })

  it('should allow redirecting to external resource', async () => {
    const res = await fetchViaHTTP(appPort, '/to-external', undefined, {
      redirect: 'manual',
    })
    const location = res.headers.get('location')
    expect(res.status).toBe(307)
    expect(location).toBe('https://google.com/')
  })

  it('should apply headers for exact match', async () => {
    const res = await fetchViaHTTP(appPort, '/add-header')
    expect(res.headers.get('x-custom-header')).toBe('hello world')
    expect(res.headers.get('x-another-header')).toBe('hello again')
  })

  it('should apply headers for multi match', async () => {
    const res = await fetchViaHTTP(appPort, '/my-headers/first')
    expect(res.headers.get('x-first-header')).toBe('first')
    expect(res.headers.get('x-second-header')).toBe('second')
  })

  it('should apply params for header key/values', async () => {
    const res = await fetchViaHTTP(appPort, '/my-other-header/first')
    expect(res.headers.get('x-path')).toBe('first')
    expect(res.headers.get('somefirst')).toBe('hi')
  })

  it('should support URL for header key/values', async () => {
    const res = await fetchViaHTTP(appPort, '/without-params/url')
    expect(res.headers.get('x-origin')).toBe('https://example.com')
  })

  it('should apply params header key/values with URL', async () => {
    const res = await fetchViaHTTP(appPort, '/with-params/url/first')
    expect(res.headers.get('x-url')).toBe('https://example.com/first')
  })

  it('should apply params header key/values with URL that has port', async () => {
    const res = await fetchViaHTTP(appPort, '/with-params/url2/first')
    expect(res.headers.get('x-url')).toBe(
      'https://example.com:8080?hello=first'
    )
  })

  it('should support named pattern for header key/values', async () => {
    const res = await fetchViaHTTP(appPort, '/named-pattern/hello')
    expect(res.headers.get('x-something')).toBe('value=hello')
    expect(res.headers.get('path-hello')).toBe('end')
  })

  it('should support proxying to external resource', async () => {
    const res = await fetchViaHTTP(appPort, '/proxy-me/first?keep=me&and=me')
    expect(res.status).toBe(200)
    expect(
      [...externalServerHits].map((u) => {
        const { pathname, query } = url.parse(u, true)
        return {
          pathname,
          query,
        }
      })
    ).toEqual([
      {
        pathname: '/first',
        query: {
          keep: 'me',
          and: 'me',
        },
      },
    ])
    expect(await res.text()).toContain('hi from external')
  })

  it('should support unnamed parameters correctly', async () => {
    const res = await fetchViaHTTP(appPort, '/unnamed/first/final', undefined, {
      redirect: 'manual',
    })
    const { pathname } = url.parse(res.headers.get('location') || '')
    expect(res.status).toBe(307)
    expect(pathname).toBe('/got-unnamed')
  })

  it('should support named like unnamed parameters correctly', async () => {
    const res = await fetchViaHTTP(
      appPort,
      '/named-like-unnamed/first',
      undefined,
      {
        redirect: 'manual',
      }
    )
    const { pathname } = url.parse(res.headers.get('location') || '')
    expect(res.status).toBe(307)
    expect(pathname).toBe('/first')
  })

  it('should add refresh header for 308 redirect', async () => {
    const res = await fetchViaHTTP(appPort, '/redirect4', undefined, {
      redirect: 'manual',
    })
    expect(res.status).toBe(308)
    expect(res.headers.get('refresh')).toBe(`0;url=/`)
  })

  it('should handle basic api rewrite successfully', async () => {
    const data = await renderViaHTTP(appPort, '/api-hello')
    expect(JSON.parse(data)).toEqual({ query: {} })
  })

  it('should handle api rewrite with un-named param successfully', async () => {
    const data = await renderViaHTTP(appPort, '/api-hello-regex/hello/world')
    expect(JSON.parse(data)).toEqual({
      query: { name: 'hello/world', first: 'hello/world' },
    })
  })

  it('should handle api rewrite with param successfully', async () => {
    const data = await renderViaHTTP(appPort, '/api-hello-param/hello')
    expect(JSON.parse(data)).toEqual({
      query: { name: 'hello', hello: 'hello' },
    })
  })

  it('should handle encoded value in the pathname correctly', async () => {
    const res = await fetchViaHTTP(
      appPort,
      '/redirect/me/to-about/' + encodeURI('\\google.com'),
      undefined,
      {
        redirect: 'manual',
      }
    )

    const { pathname, hostname, query } = url.parse(
      res.headers.get('location') || '',
      true
    )
    expect(res.status).toBe(307)
    expect(pathname).toBe(encodeURI('/\\google.com/about'))
    expect(hostname).not.toBe('google.com')
    expect(query).toEqual({})
  })

  it('should handle unnamed parameters with multi-match successfully', async () => {
    const html = await renderViaHTTP(
      appPort,
      '/unnamed-params/nested/first/second/hello/world'
    )
    const params = JSON.parse(cheerio.load(html)('p').text())
    expect(params).toEqual({ test: 'hello' })
  })

  it('should handle named regex parameters with multi-match successfully', async () => {
    const res = await fetchViaHTTP(
      appPort,
      '/docs/integrations/v2-some/thing',
      undefined,
      {
        redirect: 'manual',
      }
    )
    const { pathname } = url.parse(res.headers.get('location') || '')
    expect(res.status).toBe(307)
    expect(pathname).toBe('/integrations/-some/thing')
  })

  it('should redirect with URL in query correctly', async () => {
    const res = await fetchViaHTTP(
      appPort,
      '/to-external-with-query',
      undefined,
      {
        redirect: 'manual',
      }
    )

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'https://authserver.example.com/set-password?returnUrl=https://www.example.com/login'
    )
  })

  it('should redirect with URL in query correctly non-encoded', async () => {
    const res = await fetchViaHTTP(
      appPort,
      '/to-external-with-query',
      undefined,
      {
        redirect: 'manual',
      }
    )

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'https://authserver.example.com/set-password?returnUrl=https://www.example.com/login'
    )
  })

  if (!isDev) {
    it('should output routes-manifest successfully', async () => {
      const manifest = await fs.readJSON(
        join(appDir, '.next/routes-manifest.json')
      )

      for (const route of [
        ...manifest.dynamicRoutes,
        ...manifest.rewrites,
        ...manifest.redirects,
        ...manifest.headers,
      ]) {
        route.regex = normalizeRegEx(route.regex)
      }

      expect(manifest).toEqual({
        version: 3,
        pages404: true,
        basePath: '',
        dataRoutes: [],
        redirects: [
          {
            destination: '/:path+',
            regex: normalizeRegEx(
              '^(?:\\/((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*))\\/$'
            ),
            source: '/:path+/',
            statusCode: 308,
            internal: true,
          },
          {
            destination: '/:lang/about',
            regex: normalizeRegEx(
              '^\\/redirect\\/me\\/to-about(?:\\/([^\\/]+?))$'
            ),
            source: '/redirect/me/to-about/:lang',
            statusCode: 307,
          },
          {
            source: '/docs/router-status/:code',
            destination: '/docs/v2/network/status-codes#:code',
            statusCode: 301,
            regex: normalizeRegEx('^\\/docs\\/router-status(?:\\/([^\\/]+?))$'),
          },
          {
            source: '/docs/github',
            destination: '/docs/v2/advanced/now-for-github',
            statusCode: 301,
            regex: normalizeRegEx('^\\/docs\\/github$'),
          },
          {
            source: '/docs/v2/advanced/:all(.*)',
            destination: '/docs/v2/more/:all',
            statusCode: 301,
            regex: normalizeRegEx('^\\/docs\\/v2\\/advanced(?:\\/(.*))$'),
          },
          {
            source: '/hello/:id/another',
            destination: '/blog/:id',
            statusCode: 307,
            regex: normalizeRegEx('^\\/hello(?:\\/([^\\/]+?))\\/another$'),
          },
          {
            source: '/redirect1',
            destination: '/',
            statusCode: 307,
            regex: normalizeRegEx('^\\/redirect1$'),
          },
          {
            source: '/redirect2',
            destination: '/',
            statusCode: 301,
            regex: normalizeRegEx('^\\/redirect2$'),
          },
          {
            source: '/redirect3',
            destination: '/another',
            statusCode: 302,
            regex: normalizeRegEx('^\\/redirect3$'),
          },
          {
            source: '/redirect4',
            destination: '/',
            statusCode: 308,
            regex: normalizeRegEx('^\\/redirect4$'),
          },
          {
            source: '/redir-chain1',
            destination: '/redir-chain2',
            statusCode: 301,
            regex: normalizeRegEx('^\\/redir-chain1$'),
          },
          {
            source: '/redir-chain2',
            destination: '/redir-chain3',
            statusCode: 302,
            regex: normalizeRegEx('^\\/redir-chain2$'),
          },
          {
            source: '/redir-chain3',
            destination: '/',
            statusCode: 303,
            regex: normalizeRegEx('^\\/redir-chain3$'),
          },
          {
            destination: 'https://google.com',
            regex: normalizeRegEx('^\\/to-external$'),
            source: '/to-external',
            statusCode: 307,
          },
          {
            destination: '/with-params?first=:section&second=:name',
            regex: normalizeRegEx(
              '^\\/query-redirect(?:\\/([^\\/]+?))(?:\\/([^\\/]+?))$'
            ),
            source: '/query-redirect/:section/:name',
            statusCode: 307,
          },
          {
            destination: '/got-unnamed',
            regex: normalizeRegEx(
              '^\\/unnamed(?:\\/(first|second))(?:\\/(.*))$'
            ),
            source: '/unnamed/(first|second)/(.*)',
            statusCode: 307,
          },
          {
            destination: '/:0',
            regex: normalizeRegEx('^\\/named-like-unnamed(?:\\/([^\\/]+?))$'),
            source: '/named-like-unnamed/:0',
            statusCode: 307,
          },
          {
            destination: '/thank-you-next',
            regex: normalizeRegEx('^\\/redirect-override$'),
            source: '/redirect-override',
            statusCode: 307,
          },
          {
            destination: '/:first/:second',
            regex: normalizeRegEx(
              '^\\/docs(?:\\/(integrations|now-cli))\\/v2(.*)$'
            ),
            source: '/docs/:first(integrations|now-cli)/v2:second(.*)',
            statusCode: 307,
          },
          {
            destination: '/somewhere',
            regex: normalizeRegEx(
              '^\\/catchall-redirect(?:\\/((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*))?$'
            ),
            source: '/catchall-redirect/:path*',
            statusCode: 307,
          },
          {
            destination:
              'https://authserver.example.com/set-password?returnUrl=https%3A%2F%2Fwww.example.com/login',
            regex: normalizeRegEx('^\\/to-external-with-query$'),
            source: '/to-external-with-query',
            statusCode: 307,
          },
          {
            destination:
              'https://authserver.example.com/set-password?returnUrl=https://www.example.com/login',
            regex: normalizeRegEx('^\\/to-external-with-query-2$'),
            source: '/to-external-with-query-2',
            statusCode: 307,
          },
        ],
        headers: [
          {
            headers: [
              {
                key: 'x-custom-header',
                value: 'hello world',
              },
              {
                key: 'x-another-header',
                value: 'hello again',
              },
            ],
            regex: normalizeRegEx('^\\/add-header$'),
            source: '/add-header',
          },
          {
            headers: [
              {
                key: 'x-first-header',
                value: 'first',
              },
              {
                key: 'x-second-header',
                value: 'second',
              },
            ],
            regex: normalizeRegEx('^\\/my-headers(?:\\/(.*))$'),
            source: '/my-headers/(.*)',
          },
          {
            headers: [
              {
                key: 'x-path',
                value: ':path',
              },
              {
                key: 'some:path',
                value: 'hi',
              },
              {
                key: 'x-test',
                value: 'some:value*',
              },
              {
                key: 'x-test-2',
                value: 'value*',
              },
              {
                key: 'x-test-3',
                value: ':value?',
              },
              {
                key: 'x-test-4',
                value: ':value+',
              },
              {
                key: 'x-test-5',
                value: 'something https:',
              },
              {
                key: 'x-test-6',
                value: ':hello(world)',
              },
              {
                key: 'x-test-7',
                value: 'hello(world)',
              },
              {
                key: 'x-test-8',
                value: 'hello{1,}',
              },
              {
                key: 'x-test-9',
                value: ':hello{1,2}',
              },
              {
                key: 'content-security-policy',
                value:
                  "default-src 'self'; img-src *; media-src media1.com media2.com; script-src userscripts.example.com/:path",
              },
            ],
            regex: normalizeRegEx('^\\/my-other-header(?:\\/([^\\/]+?))$'),
            source: '/my-other-header/:path',
          },
          {
            headers: [
              {
                key: 'x-origin',
                value: 'https://example.com',
              },
            ],
            regex: normalizeRegEx('^\\/without-params\\/url$'),
            source: '/without-params/url',
          },
          {
            headers: [
              {
                key: 'x-url',
                value: 'https://example.com/:path*',
              },
            ],
            regex: normalizeRegEx(
              '^\\/with-params\\/url(?:\\/((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*))?$'
            ),
            source: '/with-params/url/:path*',
          },
          {
            headers: [
              {
                key: 'x-url',
                value: 'https://example.com:8080?hello=:path*',
              },
            ],
            regex: normalizeRegEx(
              '^\\/with-params\\/url2(?:\\/((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*))?$'
            ),
            source: '/with-params/url2/:path*',
          },
          {
            headers: [
              {
                key: 'x-something',
                value: 'applied-everywhere',
              },
            ],
            regex: normalizeRegEx(
              '^(?:\\/((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*))?$'
            ),
            source: '/:path*',
          },
          {
            headers: [
              {
                key: 'x-something',
                value: 'value=:path',
              },
              {
                key: 'path-:path',
                value: 'end',
              },
            ],
            regex: normalizeRegEx('^\\/named-pattern(?:\\/(.*))$'),
            source: '/named-pattern/:path(.*)',
          },
          {
            headers: [
              {
                key: 'x-value',
                value: ':path*',
              },
            ],
            regex: normalizeRegEx(
              '^\\/catchall-header(?:\\/((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*))?$'
            ),
            source: '/catchall-header/:path*',
          },
        ],
        rewrites: [
          {
            destination: '/auto-export/hello',
            regex: normalizeRegEx('^\\/rewriting-to-auto-export$'),
            source: '/rewriting-to-auto-export',
          },
          {
            destination: '/another/one',
            regex: normalizeRegEx('^\\/to-another$'),
            source: '/to-another',
          },
          {
            destination: '/404',
            regex: '^\\/nav$',
            source: '/nav',
          },
          {
            source: '/hello-world',
            destination: '/static/hello.txt',
            regex: normalizeRegEx('^\\/hello-world$'),
          },
          {
            source: '/',
            destination: '/another',
            regex: normalizeRegEx('^\\/$'),
          },
          {
            source: '/another',
            destination: '/multi-rewrites',
            regex: normalizeRegEx('^\\/another$'),
          },
          {
            source: '/first',
            destination: '/hello',
            regex: normalizeRegEx('^\\/first$'),
          },
          {
            source: '/second',
            destination: '/hello-again',
            regex: normalizeRegEx('^\\/second$'),
          },
          {
            destination: '/hello',
            regex: normalizeRegEx('^\\/to-hello$'),
            source: '/to-hello',
          },
          {
            destination: '/blog/post-2',
            regex: normalizeRegEx('^\\/blog\\/post-1$'),
            source: '/blog/post-1',
          },
          {
            source: '/test/:path',
            destination: '/:path',
            regex: normalizeRegEx('^\\/test(?:\\/([^\\/]+?))$'),
          },
          {
            source: '/test-overwrite/:something/:another',
            destination: '/params/this-should-be-the-value',
            regex: normalizeRegEx(
              '^\\/test-overwrite(?:\\/([^\\/]+?))(?:\\/([^\\/]+?))$'
            ),
          },
          {
            source: '/params/:something',
            destination: '/with-params',
            regex: normalizeRegEx('^\\/params(?:\\/([^\\/]+?))$'),
          },
          {
            destination: '/with-params?first=:section&second=:name',
            regex: normalizeRegEx(
              '^\\/query-rewrite(?:\\/([^\\/]+?))(?:\\/([^\\/]+?))$'
            ),
            source: '/query-rewrite/:section/:name',
          },
          {
            destination: '/_next/:path*',
            regex: normalizeRegEx(
              '^\\/hidden\\/_next(?:\\/((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*))?$'
            ),
            source: '/hidden/_next/:path*',
          },
          {
            destination: `http://localhost:${externalServerPort}/:path*`,
            regex: normalizeRegEx(
              '^\\/proxy-me(?:\\/((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*))?$'
            ),
            source: '/proxy-me/:path*',
          },
          {
            destination: '/api/hello',
            regex: normalizeRegEx('^\\/api-hello$'),
            source: '/api-hello',
          },
          {
            destination: '/api/hello?name=:first*',
            regex: normalizeRegEx('^\\/api-hello-regex(?:\\/(.*))$'),
            source: '/api-hello-regex/:first(.*)',
          },
          {
            destination: '/api/hello?hello=:name',
            regex: normalizeRegEx('^\\/api-hello-param(?:\\/([^\\/]+?))$'),
            source: '/api-hello-param/:name',
          },
          {
            destination: '/api/dynamic/:name?hello=:name',
            regex: normalizeRegEx('^\\/api-dynamic-param(?:\\/([^\\/]+?))$'),
            source: '/api-dynamic-param/:name',
          },
          {
            destination: '/with-params',
            regex: normalizeRegEx('^(?:\\/([^\\/]+?))\\/post-321$'),
            source: '/:path/post-321',
          },
          {
            destination: '/with-params',
            regex: normalizeRegEx(
              '^\\/unnamed-params\\/nested(?:\\/(.*))(?:\\/([^\\/]+?))(?:\\/(.*))$'
            ),
            source: '/unnamed-params/nested/(.*)/:test/(.*)',
          },
          {
            destination: '/with-params',
            regex: normalizeRegEx(
              '^\\/catchall-rewrite(?:\\/((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*))?$'
            ),
            source: '/catchall-rewrite/:path*',
          },
          {
            destination: '/with-params?another=:path*',
            regex: normalizeRegEx(
              '^\\/catchall-query(?:\\/((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*))?$'
            ),
            source: '/catchall-query/:path*',
          },
        ],
        dynamicRoutes: [
          {
            namedRegex: '^/another/(?<id>[^/]+?)(?:/)?$',
            page: '/another/[id]',
            regex: normalizeRegEx('^\\/another\\/([^\\/]+?)(?:\\/)?$'),
            routeKeys: {
              id: 'id',
            },
          },
          {
            namedRegex: '^/api/dynamic/(?<slug>[^/]+?)(?:/)?$',
            page: '/api/dynamic/[slug]',
            regex: normalizeRegEx('^\\/api\\/dynamic\\/([^\\/]+?)(?:\\/)?$'),
            routeKeys: {
              slug: 'slug',
            },
          },
          {
            namedRegex: '^/auto\\-export/(?<slug>[^/]+?)(?:/)?$',
            page: '/auto-export/[slug]',
            regex: normalizeRegEx('^\\/auto\\-export\\/([^\\/]+?)(?:\\/)?$'),
            routeKeys: {
              slug: 'slug',
            },
          },
          {
            namedRegex: '^/blog/(?<post>[^/]+?)(?:/)?$',
            page: '/blog/[post]',
            regex: normalizeRegEx('^\\/blog\\/([^\\/]+?)(?:\\/)?$'),
            routeKeys: {
              post: 'post',
            },
          },
        ],
      })
    })

    it('should have redirects/rewrites in build output with debug flag', async () => {
      const manifest = await fs.readJSON(
        join(appDir, '.next/routes-manifest.json')
      )
      const cleanStdout = stripAnsi(stdout)
      expect(cleanStdout).toContain('Redirects')
      expect(cleanStdout).toContain('Rewrites')
      expect(cleanStdout).toContain('Headers')
      expect(cleanStdout).toMatch(/source.*?/i)
      expect(cleanStdout).toMatch(/destination.*?/i)

      for (const route of [...manifest.redirects, ...manifest.rewrites]) {
        expect(cleanStdout).toContain(route.source)
        expect(cleanStdout).toContain(route.destination)
      }

      for (const route of manifest.headers) {
        expect(cleanStdout).toContain(route.source)

        for (const header of route.headers) {
          expect(cleanStdout).toContain(header.key)
          expect(cleanStdout).toContain(header.value)
        }
      }
    })
  }
}

describe('Custom routes', () => {
  beforeEach(() => {
    externalServerHits = new Set()
  })
  beforeAll(async () => {
    externalServerPort = await findPort()
    externalServer = http.createServer((req, res) => {
      externalServerHits.add(req.url)
      res.end('hi from external')
    })
    await new Promise((resolve, reject) => {
      externalServer.listen(externalServerPort, (error) => {
        if (error) return reject(error)
        resolve()
      })
    })
    nextConfigRestoreContent = await fs.readFile(nextConfigPath, 'utf8')
    await fs.writeFile(
      nextConfigPath,
      nextConfigRestoreContent.replace(/__EXTERNAL_PORT__/, externalServerPort)
    )
  })
  afterAll(async () => {
    externalServer.close()
    await fs.writeFile(nextConfigPath, nextConfigRestoreContent)
  })

  describe('dev mode', () => {
    beforeAll(async () => {
      appPort = await findPort()
      app = await launchApp(appDir, appPort)
      buildId = 'development'
    })
    afterAll(() => killApp(app))
    runTests(true)
  })

  describe('no-op rewrite', () => {
    beforeAll(async () => {
      appPort = await findPort()
      app = await launchApp(appDir, appPort, {
        env: {
          ADD_NOOP_REWRITE: 'true',
        },
      })
    })
    afterAll(() => killApp(app))

    it('should not error for no-op rewrite and auto export dynamic route', async () => {
      const browser = await webdriver(appPort, '/auto-export/my-slug')
      const html = await browser.eval(() => document.documentElement.innerHTML)
      expect(html).toContain(`auto-export my-slug`)
    })
  })

  describe('server mode', () => {
    beforeAll(async () => {
      const { stdout: buildStdout, stderr: buildStderr } = await nextBuild(
        appDir,
        ['-d'],
        {
          stdout: true,
          stderr: true,
        }
      )
      stdout = buildStdout
      stderr = buildStderr
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
      buildId = await fs.readFile(join(appDir, '.next/BUILD_ID'), 'utf8')
    })
    afterAll(() => killApp(app))
    runTests()

    it('should not show warning for custom routes when not next export', async () => {
      expect(stderr).not.toContain(
        `rewrites, redirects, and headers are not applied when exporting your application detected`
      )
    })
  })

  describe('export', () => {
    let exportStderr = ''
    let exportVercelStderr = ''

    beforeAll(async () => {
      const { stdout: buildStdout, stderr: buildStderr } = await nextBuild(
        appDir,
        ['-d'],
        {
          stdout: true,
          stderr: true,
        }
      )
      const exportResult = await nextExport(
        appDir,
        { outdir: join(appDir, 'out') },
        { stderr: true }
      )
      const exportVercelResult = await nextExport(
        appDir,
        { outdir: join(appDir, 'out') },
        {
          stderr: true,
          env: {
            NOW_BUILDER: '1',
          },
        }
      )

      stdout = buildStdout
      stderr = buildStderr
      exportStderr = exportResult.stderr
      exportVercelStderr = exportVercelResult.stderr
    })

    it('should not show warning for custom routes when not next export', async () => {
      expect(stderr).not.toContain(
        `rewrites, redirects, and headers are not applied when exporting your application detected`
      )
    })

    it('should not show warning for custom routes when next export on Vercel', async () => {
      expect(exportVercelStderr).not.toContain(
        `rewrites, redirects, and headers are not applied when exporting your application detected`
      )
    })

    it('should show warning for custom routes with next export', async () => {
      expect(exportStderr).toContain(
        `rewrites, redirects, and headers are not applied when exporting your application, detected (rewrites, redirects, headers)`
      )
    })
  })

  describe('serverless mode', () => {
    beforeAll(async () => {
      nextConfigContent = await fs.readFile(nextConfigPath, 'utf8')
      await fs.writeFile(
        nextConfigPath,
        nextConfigContent.replace(/\/\/ target/, 'target'),
        'utf8'
      )
      const { stdout: buildStdout } = await nextBuild(appDir, ['-d'], {
        stdout: true,
      })
      stdout = buildStdout
      appPort = await findPort()
      app = await nextStart(appDir, appPort, {
        onStdout: (msg) => {
          stdout += msg
        },
      })
      buildId = await fs.readFile(join(appDir, '.next/BUILD_ID'), 'utf8')
    })
    afterAll(async () => {
      await fs.writeFile(nextConfigPath, nextConfigContent, 'utf8')
      await killApp(app)
    })

    runTests()
  })

  describe('raw serverless mode', () => {
    beforeAll(async () => {
      nextConfigContent = await fs.readFile(nextConfigPath, 'utf8')
      await fs.writeFile(
        nextConfigPath,
        nextConfigContent.replace(/\/\/ target/, 'target'),
        'utf8'
      )
      await nextBuild(appDir)

      appPort = await findPort()
      app = await initNextServerScript(join(appDir, 'server.js'), /ready on/, {
        ...process.env,
        PORT: appPort,
      })
    })
    afterAll(async () => {
      await fs.writeFile(nextConfigPath, nextConfigContent, 'utf8')
      await killApp(app)
    })

    it('should apply rewrites in lambda correctly for page route', async () => {
      const html = await renderViaHTTP(appPort, '/query-rewrite/first/second')
      const data = JSON.parse(cheerio.load(html)('p').text())
      expect(data).toEqual({
        first: 'first',
        second: 'second',
        section: 'first',
        name: 'second',
      })
    })

    it('should apply rewrites in lambda correctly for dynamic route', async () => {
      const html = await renderViaHTTP(appPort, '/blog/post-1')
      expect(html).toContain('post-2')
    })

    it('should apply rewrites in lambda correctly for API route', async () => {
      const data = JSON.parse(
        await renderViaHTTP(appPort, '/api-hello-param/first')
      )
      expect(data).toEqual({
        query: {
          name: 'first',
          hello: 'first',
        },
      })
    })

    it('should apply rewrites in lambda correctly for dynamic API route', async () => {
      const data = JSON.parse(
        await renderViaHTTP(appPort, '/api-dynamic-param/first')
      )
      expect(data).toEqual({
        query: {
          slug: 'first',
          hello: 'first',
        },
      })
    })
  })

  describe('should load custom routes when only one type is used', () => {
    const runSoloTests = (isDev) => {
      const buildAndStart = async () => {
        if (isDev) {
          appPort = await findPort()
          app = await launchApp(appDir, appPort)
        } else {
          const { code } = await nextBuild(appDir)
          if (code !== 0) throw new Error(`failed to build, got code ${code}`)
          appPort = await findPort()
          app = await nextStart(appDir, appPort)
        }
      }

      it('should work with just headers', async () => {
        nextConfigContent = await fs.readFile(nextConfigPath, 'utf8')
        await fs.writeFile(
          nextConfigPath,
          nextConfigContent.replace(/(async (?:redirects|rewrites))/g, '$1s')
        )
        await buildAndStart()

        const res = await fetchViaHTTP(appPort, '/add-header')

        const res2 = await fetchViaHTTP(appPort, '/docs/github', undefined, {
          redirect: 'manual',
        })
        const res3 = await fetchViaHTTP(appPort, '/hello-world')

        await fs.writeFile(nextConfigPath, nextConfigContent)
        await killApp(app)

        expect(res.headers.get('x-custom-header')).toBe('hello world')
        expect(res.headers.get('x-another-header')).toBe('hello again')

        expect(res2.status).toBe(404)
        expect(res3.status).toBe(404)
      })

      it('should work with just rewrites', async () => {
        nextConfigContent = await fs.readFile(nextConfigPath, 'utf8')
        await fs.writeFile(
          nextConfigPath,
          nextConfigContent.replace(/(async (?:redirects|headers))/g, '$1s')
        )
        await buildAndStart()

        const res = await fetchViaHTTP(appPort, '/add-header')

        const res2 = await fetchViaHTTP(appPort, '/docs/github', undefined, {
          redirect: 'manual',
        })
        const res3 = await fetchViaHTTP(appPort, '/hello-world')

        await fs.writeFile(nextConfigPath, nextConfigContent)
        await killApp(app)

        expect(res.headers.get('x-custom-header')).toBeFalsy()
        expect(res.headers.get('x-another-header')).toBeFalsy()

        expect(res2.status).toBe(404)

        expect(res3.status).toBe(200)
        expect(await res3.text()).toContain('hello world!')
      })

      it('should work with just redirects', async () => {
        nextConfigContent = await fs.readFile(nextConfigPath, 'utf8')
        await fs.writeFile(
          nextConfigPath,
          nextConfigContent.replace(/(async (?:rewrites|headers))/g, '$1s')
        )
        await buildAndStart()

        const res = await fetchViaHTTP(appPort, '/add-header')

        const res2 = await fetchViaHTTP(appPort, '/docs/github', undefined, {
          redirect: 'manual',
        })
        const res3 = await fetchViaHTTP(appPort, '/hello world')

        await fs.writeFile(nextConfigPath, nextConfigContent)
        await killApp(app)

        expect(res.headers.get('x-custom-header')).toBeFalsy()
        expect(res.headers.get('x-another-header')).toBeFalsy()

        const { pathname } = url.parse(res2.headers.get('location'))
        expect(res2.status).toBe(301)
        expect(pathname).toBe('/docs/v2/advanced/now-for-github')

        expect(res3.status).toBe(404)
      })
    }

    describe('dev mode', () => {
      runSoloTests(true)
    })

    describe('production mode', () => {
      runSoloTests()
    })
  })
})
