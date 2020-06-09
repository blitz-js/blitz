import 'tailwindcss/tailwind.css'

import {Head} from 'blitz'
import {AppProps} from 'next/app'

import {OfflineAlert} from 'app/components/OfflineAlert'

const MyApp = ({Component, pageProps}: AppProps): JSX.Element => (
  <div className="min-h-screen font-sans antialiased text-gray-900">
    <Head>
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    </Head>
    <OfflineAlert />
    <Component {...pageProps} />
  </div>
)

export default MyApp
