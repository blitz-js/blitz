import "typeface-libre-franklin"
import "typeface-roboto"
import "typeface-roboto-mono"
import "@/styles/main.css"
import "focus-visible"

import {Head} from "blitz"
import * as Fathom from "fathom-client"
// import ProgressBar from "@badrap/bar-of-progress"
import {ThemeProvider} from "next-themes"
import {useEffect} from "react"

import {Title} from "@/components/Title"

// const progress = new ProgressBar({
//   size: 2,
//   color: "#45009D",
//   className: "bar-of-progress",
//   delay: 100,
// })

// this fixes safari jumping to the bottom of the page
// when closing the search modal using the `esc` key
// if (typeof window !== "undefined") {
//   progress.start()
//   progress.finish()
// }

// Router.events.on("routeChangeStart", progress.start)
// Router.events.on("routeChangeComplete", () => {
// progress.finish()
// window.scrollTo(0, 0)
// })
// Router.events.on("routeChangeError", progress.finish)

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
