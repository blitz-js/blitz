import React from 'react'
import Link from 'next/link'

export default function Page() {
  return (
    <h1>
      I am home.{' '}
      <Link href="/posts/5">
        <a>Click here</a>
      </Link>
    </h1>
  )
}
