import 'tailwindcss/tailwind.css'

import {AppProps, Head} from 'blitz'

import {OfflineAlert} from 'app/components/OfflineAlert'

const MyApp = ({Component, pageProps}: AppProps): JSX.Element => (
  <div className="min-h-screen font-sans antialiased text-gray-900 bg-gray-100">
    <Head>
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    </Head>
    <OfflineAlert />
    <Component {...pageProps} />
  </div>
)

export default MyApp
