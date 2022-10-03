import {ReactNode, Suspense} from "react"
import Head from "next/head"
import {useQuery} from "@blitzjs/rpc"
import getSettings from "../queries/getSettings"

type LayoutProps = {
  title?: string
  children: ReactNode
}

/*
 * This layout is supplied to show how to make use of SEO options provided by Ghost.
 */
const GhostLayout = ({title, children}: LayoutProps) => {
  // NOTE: If you want to use settings from ghost, move this to getInitialProps for better SEO
  const [settings] = useQuery(getSettings, {}, {suspense: false})

  return (
    <>
      <Head>
        <title>
          {settings?.title} - {title || "my ghost blog"}
        </title>

        <link rel="icon" href="/favicon.ico" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={settings?.og_title ?? ""} />
        <meta property="og:description" content={settings?.og_description ?? ""} />
        <meta property="og:image" content={settings?.og_title ?? ""} />

        <meta property="article:publisher" content={settings?.facebook ?? ""} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={settings?.twitter_title ?? ""} />
        <meta name="twitter:description" content={settings?.twitter_description ?? ""} />
        <meta name="twitter:url" content={settings?.url ?? ""} />
        <meta name="twitter:image" content={settings?.twitter_image ?? ""} />
        <meta name="twitter:site" content={settings?.twitter ?? ""} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            publisher: {
              "@type": "Organization",
              name: settings?.og_title,
              url: settings?.url,
              logo: {
                "@type": "ImageObject",
                url: settings?.og_title,
              },
            },
            url: settings?.url,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": settings?.url,
            },
            description: settings?.og_description,
          })}
        </script>
      </Head>

      <h1>
        {settings?.title} - {title || "blitz-ghost"}
      </h1>

      <br />

      <Suspense fallback={() => <>Loading...</>}>{children}</Suspense>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;700&display=swap");

        html,
        body {
          padding: 0;
          margin: 0;
          font-family: "Libre Franklin", -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        .image-card {
          position: relative;
          display: block;
          overflow: hidden;
          border-radius: 3px;
        }

        .image-card img {
          width: 100%;
          height: 200px;
          -o-object-fit: cover;
          object-fit: cover;
        }
      `}</style>
    </>
  )
}

export default GhostLayout
