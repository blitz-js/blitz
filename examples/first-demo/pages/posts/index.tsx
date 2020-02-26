import React from 'react'
import Link from 'next/link'
import {harnessServerProps} from '@blitzjs/core'
import {PostsController} from '../../controllers/posts'

export const unstable_getServerProps = harnessServerProps(PostsController)

export default Page
function Page({posts}) {
  return (
    <div className="container flex flex-col items-center max-w-md  mx-auto py-20 px-2">
      <p className="fixed top-0 right-0 pt-3 px-4">
        <a href="https://github.com/blitz-js/blitz" className="text-purple-700 underline text-md">
          View on GitHub
        </a>
      </p>

      <h1 className="text-3xl">{posts.length} Posts</h1>
      <p className="mt-5">
        <Link href="/">
          <a className="underline text-purple-700 text-sm">Back Home</a>
        </Link>
      </p>
      <Link href={`/posts/new`}>
        <a className="my-8 bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded">New Post</a>
      </Link>
      <div className="w-full">
        {posts.map(post => (
          <p key={post.id} className="mb-4">
            <Link href="/posts/[id]" as={`/posts/${post.id}`}>
              <a className="underline text-purple-700 text-1xl">{post.title}</a>
            </Link>
          </p>
        ))}
      </div>
    </div>
  )
}
