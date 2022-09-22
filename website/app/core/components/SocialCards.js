import Head from "next/head"

export const SocialCards = ({imageUrl}) => {
  return (
    <Head>
      <meta key="twitter:image" name="twitter:image" content={"https://blitzjs.com" + imageUrl} />
      <meta key="og:image" property="og:image" content={"https://blitzjs.com" + imageUrl} />
    </Head>
  )
}
