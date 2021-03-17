import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Page(props) {
  const router = useRouter()

  return (
    <>
      <p id="links">links page</p>
      <p id="props">{JSON.stringify(props)}</p>
      <p id="router-locale">{router.locale}</p>
      <p id="router-default-locale">{router.defaultLocale}</p>
      <p id="router-locales">{JSON.stringify(router.locales)}</p>
      <p id="router-query">{JSON.stringify(router.query)}</p>
      <p id="router-pathname">{router.pathname}</p>
      <p id="router-as-path">{router.asPath}</p>

      <Link href="/gsp" locale="en-US">
        <a id="to-gsp-en-us">to /gsp</a>
      </Link>
      <br />

      <Link href="/gsp" locale="nl-NL">
        <a id="to-gsp-nl-nl">to /gsp</a>
      </Link>
      <br />

      <Link href="/gsp" locale="fr">
        <a id="to-gsp-fr">to /gsp</a>
      </Link>
      <br />

      <Link href="/" locale="fr">
        <a id="to-index-fr">to /</a>
      </Link>
    </>
  )
}
