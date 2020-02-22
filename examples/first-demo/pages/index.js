import React from "react"
import Head from "next/head"
import Link from "next/link"

const Home = props => (
  <div>
    <Head>
      <title>First Blitz Demo</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <div className="container flex flex-col items-center py-20">
      <h1 className="text-3xl">First Ever Blitz ⚡️ Demo!</h1>
      <p className="italic mt-10">Notice the URL bar as you navigate</p>
      <p className="mt-10">
        <Link href="/posts">
          <a className="underline text-purple-700 text-2xl">View Posts</a>
        </Link>
      </p>
    </div>
  </div>
)

export default Home
