import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export async function getServerSideProps({ params }) {
  return {
    props: {
      world: 'world',
      params: params || {},
      time: new Date().getTime(),
      random: Math.random(),
    },
  }
}

export default ({ world, time, params, random }) => {
  return (
    <>
      <p>hello: {world}</p>
      <span>time: {time}</span>
      <div id="random">{random}</div>
      <div id="params">{JSON.stringify(params)}</div>
      <div id="query">{JSON.stringify(useRouter().query)}</div>
      <Link href="/">
        <a id="home">to home</a>
      </Link>
      <br />
      <Link href="/another">
        <a id="another">to another</a>
      </Link>
    </>
  )
}
