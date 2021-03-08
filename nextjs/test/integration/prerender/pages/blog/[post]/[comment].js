import React from 'react'
import Link from 'next/link'

export async function getStaticPaths() {
  return {
    paths: [
      '/blog/post-1/comment-1',
      { params: { post: 'post-2', comment: 'comment-2' } },
    ],
    fallback: true,
  }
}

export async function getStaticProps({ params }) {
  return {
    props: {
      post: params.post,
      comment: params.comment,
      time: new Date().getTime(),
    },
    revalidate: 2,
  }
}

export default ({ post, comment, time }) => {
  // we're in a loading state
  if (!post) {
    return <p>loading...</p>
  }

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
