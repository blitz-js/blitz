// import '@reach/tabs/styles.css'
import 'tailwindcss/tailwind.css'
import 'tippy.js/dist/tippy.css'

import {AppProps, Head} from 'blitz'

const MyApp = ({Component, pageProps}: AppProps): JSX.Element => (
  <>
    <Head>
      <title>Blitz GUI</title>
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    </Head>
    <div className="min-h-screen font-sans antialiased text-gray-900 bg-gray-100">
      <div className="flex h-screen">
        <Component {...pageProps} />
      </div>
    </div>
  </>
)

export default MyApp
