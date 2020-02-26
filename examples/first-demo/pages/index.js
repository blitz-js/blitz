import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

const Home = props => (
  <div>
    <Head>
      <title>First Blitz Demo</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <p className="fixed top-0 right-0 pt-3 px-4">
      <a href="https://github.com/blitz-js/blitz" className="text-purple-700 underline text-md">
        View on GitHub
      </a>
    </p>

    <div className="container flex flex-col items-center py-20 max-w-md mx-auto">
      <h1 className="text-3xl">First Ever Blitz ⚡️ Demo!</h1>
      <p className="mt-10">
        This demo is deployed on{' '}
        <a href="https://zeit.co" target="_blank" rel="noreferer,noopener" className="underline">
          Zeit
        </a>
        , as a combo of static pages and serverless functions.
        <br />
        <br />
        It has <strong>no client-side data fetching or state management</strong>. All data reads & writes are
        server-side using Prisma 2.
      </p>
      <p className="mt-10">
        <Link href="/posts">
          <a className="underline text-purple-700 text-2xl">View Posts</a>
        </Link>
      </p>
    </div>
  </div>
)

export default Home
