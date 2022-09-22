import "typeface-libre-franklin"
import "typeface-roboto"
import "typeface-roboto-mono"
import "@/styles/main.css"
import "focus-visible"
import * as Fathom from "fathom-client"
import Head from "next/head"
import {ThemeProvider} from "next-themes"
import {useEffect} from "react"

import {Title} from "@/components/Title"

export default function App({Component, pageProps, router}) {
  const meta = Component.meta || {}

  useEffect(() => {
    // Initialize Fathom when the app loads
    Fathom.load("NGIOZUKS", {
      includedDomains: ["blitzjs.com"],
      excludedDomains: ["canary.blitzjs.com", "legacy.blitzjs.com", "alpha.blitzjs.com"],
    })

    function onRouteChangeComplete() {
      Fathom.trackPageview()

      if (typeof window !== "undefined") {
        window.scrollTo(0, 0)
      }
    }
    // Record a pageview when route changes
    router.events.on("routeChangeComplete", onRouteChangeComplete)

    // Unassign event listener
    return () => {
      router.events.off("routeChangeComplete", onRouteChangeComplete)
    }
  }, [router.events])

  return (
    <>
      <Title>{meta.metaTitle || meta.title}</Title>
      <Head>
        <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
        <meta key="twitter:site" name="twitter:site" content="@blitz_js" />
        <meta key="twitter:description" name="twitter:description" content={meta.description} />
        <meta key="twitter:creator" name="twitter:creator" content="@blitz_js" />
        <meta key="og:url" property="og:url" content={`https://blitzjs.com${router.pathname}`} />
        <meta key="og:type" property="og:type" content="article" />
        <meta key="og:description" property="og:description" content={meta.description} />
      </Head>
      <ThemeProvider defaultTheme="dark" enableSystem={false} attribute="class">
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}
