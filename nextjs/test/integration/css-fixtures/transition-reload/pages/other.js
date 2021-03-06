import Link from 'next/link'
import css from './other.module.css'

export default function Other() {
  return (
    <main>
      <Link href="/" prefetch={false}>
        <a id="link-index">index page</a>
      </Link>
      <br />
      <h1 id="red-title" className={css.root}>
        Red
      </h1>
    </main>
  )
}
