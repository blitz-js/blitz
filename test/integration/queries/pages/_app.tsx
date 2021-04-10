import {AppProps} from "blitz"

export default function App({Component, pageProps}: AppProps) {
  return <Component {...pageProps} />
}
