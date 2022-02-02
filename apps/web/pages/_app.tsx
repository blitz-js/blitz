import type {AppProps} from "next/app"
import {withBlitz} from "../src/client-setup"

function MyApp({Component, pageProps}: AppProps) {
  return <Component {...pageProps} />
}

export default withBlitz(MyApp)
