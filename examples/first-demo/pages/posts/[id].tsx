import React from 'react'
import Link from 'next/link'
import {harnessServerProps, Form} from '@blitzjs/core'
import {PostsController} from '../../controllers/posts'

export const unstable_getServerProps = harnessServerProps(PostsController)

export default Page
function Page({post}) {
  return (
    <div className="container flex flex-col items-center py-20 max-w-lg mx-auto px-2">
      <p className="fixed top-0 right-0 pt-3 px-4">
        <a href="https://github.com/blitz-js/blitz" className="text-purple-700 underline text-md">
          View on GitHub
        </a>
      </p>

      <h1 className="text-3xl">{post.title}</h1>
      <p className="my-5">
        <Link href="/posts">
          <a className="underline text-purple-700 text-sm">Back to Posts</a>
        </Link>
      </p>

      <p className="my-5 rounded border-r border-b border-l border-t border-gray-400 p-6 w-full">
        {post.content || <i>No Content</i>}
      </p>

      <div className="flex">
        <Form action={`/api/posts/${post.id}`} method="DELETE">
          <button className="disabled:opacity-60 bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded">
            Delete
          </button>
        </Form>
        <Link href="/posts/[id]/edit" as={`/posts/${post.id}/edit`}>
          <a className="ml-2 bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded">Edit</a>
        </Link>
      </div>

      <h2 className="font-bold mt-10">Comments</h2>
      {post.comments.map(comment => (
        <div
          key={comment.id}
          className="my-2 rounded border-r border-b border-l border-t border-gray-400 p-2 w-full flex justify-between">
          <div>{comment.content}</div>
          <Form action={`/api/comments/${comment.id}`} method="DELETE">
            <button className="disabled:opacity-60 text-red-700">Delete</button>
          </Form>
        </div>
      ))}
      <Form action={`/api/posts/${post.id}/comments`} method="POST" className="min-w-full mt-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">New Comment</label>
          <input
            name="content"
            className="disabled:bg-gray-400 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="flex justify-end">
          <button className="disabled:opacity-60 ml-2 bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded">
            Comment
          </button>
        </div>
      </Form>

      <p className="py-3">For your safety, content can only be the name of a fruit</p>
    </div>
  )
}
