import Link from 'next/link'

export default () => (
  <div id="empty-hash-link-page">
    <Link href="/hello#">
      <a id="empty-hash-link">Empty Hash link</a>
    </Link>
  </div>
)
