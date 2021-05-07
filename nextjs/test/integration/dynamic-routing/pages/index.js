import Link from 'next/link'
import { useRouter } from 'next/router'

if (typeof window !== 'undefined') {
  window.caughtWarns = []
  const origWarn = window.console.warn
  window.console.warn = function (...args) {
    window.caughtWarns.push(args)
    origWarn(...args)
  }
}

const Page = () => {
  return (
    <div>
      <h3>My blog</h3>
      <Link href="/[name]" as="/post-1">
        <a id="view-post-1">View post 1</a>
      </Link>
      <br />
      <Link href="/[name]" as="/post-1#my-hash">
        <a id="view-post-1-hash-1">View post 1 (hash)</a>
      </Link>
      <br />
      <Link href="/post-1#my-hash">
        <a id="view-post-1-hash-1-href-only">View post 1 (hash only href)</a>
      </Link>
      <br />
      <Link
        href={{
          hash: 'my-hash',
          pathname: '/[name]',
          query: { name: 'post-1' },
        }}
      >
        <a id="view-post-1-hash-1-interpolated">
          View post 1 (hash interpolated)
        </a>
      </Link>
      <br />
      <Link href="/post-1">
        <a id="view-post-1-no-as">View post 1 (no as)</a>
      </Link>
      <br />
      <Link
        href={{
          pathname: '/[name]',
          query: { name: 'post-1' },
        }}
      >
        <a id="view-post-1-interpolated">View post 1 (interpolated)</a>
      </Link>
      <br />
      <Link
        href={{
          pathname: '/[name]',
          query: { another: 'value' },
        }}
      >
        <a id="view-post-1-interpolated-incorrectly">
          View post 1 (interpolated incorrectly)
        </a>
      </Link>
      <br />
      <Link
        href={{
          pathname: '/[name]',
          query: { name: 'post-1', another: 'value' },
        }}
      >
        <a id="view-post-1-interpolated-more-query">
          View post 1 (interpolated additional query)
        </a>
      </Link>
      <br />
      <Link href="/[name]/comments" as="/post-1/comments">
        <a id="view-post-1-comments">View post 1 comments</a>
      </Link>
      <br />
      <Link href="/[name]/[comment]" as="/post-1/comment-1">
        <a id="view-post-1-comment-1">View comment 1 on post 1</a>
      </Link>
      <br />
      <Link href="/post-1/comment-1">
        <a id="view-post-1-comment-1-no-as">View comment 1 on post 1 (no as)</a>
      </Link>
      <br />
      <Link
        href={{
          pathname: '/[name]/[comment]',
          query: { name: 'post-1', comment: 'comment-1' },
        }}
      >
        <a id="view-post-1-comment-1-interpolated">
          View comment 1 on post 1 (interpolated)
        </a>
      </Link>
      <br />
      <Link href="/added-later/first">
        <a id="added-later-link">/added-later/first</a>
      </Link>
      <br />
      <Link href="/blog/[post]/comment/[id]" as="/blog/321/comment/123">
        <a id="view-nested-dynamic-cmnt">View comment 123 on blog post 321</a>
      </Link>
      <br />
      <Link href="/[name]?fromHome=true" as="/post-1?fromHome=true">
        <a id="view-post-1-with-query">View post 1 with query</a>
      </Link>
      <br />
      <Link href="/on-mount/[post]" as="/on-mount/test-w-hash#item-400">
        <a id="view-dynamic-with-hash">View test with hash</a>
      </Link>
      <br />
      <Link href="/p1/p2/all-ssr/[...rest]" as="/p1/p2/all-ssr/hello">
        <a id="catch-all-single">Catch-all route (single)</a>
      </Link>
      <br />
      <Link href="/p1/p2/all-ssr/[...rest]" as="/p1/p2/all-ssr/hello1/hello2">
        <a id="catch-all-multi">Catch-all route (multi)</a>
      </Link>
      <br />
      <Link
        href="/p1/p2/all-ssr/[...rest]"
        as="/p1/p2/all-ssr/hello1%2F/he%2Fllo2"
      >
        <a id="catch-all-enc">Catch-all route (encoded)</a>
      </Link>
      <br />
      <Link href="/p1/p2/all-ssr/[...rest]" as="/p1/p2/all-ssr/:42">
        <a id="catch-all-colonnumber">Catch-all route :42</a>
      </Link>
      <br />
      <Link href="/p1/p2/all-ssg/[...rest]" as="/p1/p2/all-ssg/hello">
        <a id="ssg-catch-all-single">Catch-all route (single)</a>
      </Link>
      <br />
      <Link
        href={{
          pathname: '/p1/p2/all-ssg/[...rest]',
          query: { rest: ['hello'] },
        }}
      >
        <a id="ssg-catch-all-single-interpolated">
          Catch-all route (single interpolated)
        </a>
      </Link>
      <br />
      <Link href="/p1/p2/all-ssg/[...rest]" as="/p1/p2/all-ssg/hello1/hello2">
        <a id="ssg-catch-all-multi">Catch-all route (multi)</a>
      </Link>
      <br />
      <Link href="/p1/p2/all-ssg/hello1/hello2">
        <a id="ssg-catch-all-multi-no-as">Catch-all route (multi)</a>
      </Link>
      <br />
      <Link
        href={{
          pathname: '/p1/p2/all-ssg/[...rest]',
          query: { rest: ['hello1', 'hello2'] },
        }}
      >
        <a id="ssg-catch-all-multi-interpolated">
          Catch-all route (multi interpolated)
        </a>
      </Link>
      <br />
      <Link
        href="/p1/p2/nested-all-ssg/[...rest]"
        as="/p1/p2/nested-all-ssg/hello"
      >
        <a id="nested-ssg-catch-all-single">Nested Catch-all route (single)</a>
      </Link>
      <br />
      <Link
        href="/p1/p2/nested-all-ssg/[...rest]"
        as="/p1/p2/nested-all-ssg/hello1/hello2"
      >
        <a id="nested-ssg-catch-all-multi">Nested Catch-all route (multi)</a>
      </Link>
      <br />
      <Link href="/d/dynamic-1">
        <a id="dynamic-route-no-as">Dynamic route no as</a>
      </Link>
      <p id="query">{JSON.stringify(Object.keys(useRouter().query))}</p>
    </div>
  )
}

export default Page
