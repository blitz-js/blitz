import React from 'react'
import Link from 'next/link'

export async function getServerSideProps({ query }) {
  return {
    props: {
      post: query.post,
      comment: query.comment,
      time: new Date().getTime(),
    },
  }
}

export default ({ post, comment, time }) => {
  return (
    <>
      <p>Post: {post}</p>
      <p>Comment: {comment}</p>
      <span>time: {time}</span>
      <Link href="/">
        <a id="home">to home</a>
      </Link>
    </>
  )
}
