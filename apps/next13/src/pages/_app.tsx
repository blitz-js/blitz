import {AppProps} from "@blitzjs/next"
import {withBlitz} from "../blitz-client"

function MyApp({Component, pageProps}: AppProps) {
  return <Component {...pageProps} />
}

export default withBlitz(MyApp, true)
