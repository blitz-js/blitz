import {Head} from "blitz"

export function Title({children}) {
  let title = children + (!children?.match(/blitz/i) ? ` - Blitz.js` : "")

  return (
    <Head>
      <title key="title">{title}</title>
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="og:title" property="og:title" content={title} />
    </Head>
  )
}
