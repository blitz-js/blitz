import { withBlitz } from "app/blitz-client";
function MyApp({Component, pageProps}) {
  return <Component {...pageProps} />
}

export default withBlitz(MyApp);
