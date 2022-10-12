import Image from "next/image"
import Link from "next/link"
import {useMutation, useQuery} from "@blitzjs/rpc"
import {Routes, BlitzPage} from "@blitzjs/next"
import {useRouter} from "next/router"
import GhostLayout from "app/ghost/layouts/GhostLayout"
import getPostBySlug from "app/ghost/queries/getPostBySlug"

/*
 * This file is just for a very basic demonstration of using ghost with blitz.
 */
const GhostPostPage: BlitzPage = (args) => {
  const router = useRouter()

  const {slug} = router.params

  const [post] = useQuery(getPostBySlug, {slug})
  return (
    <div>
      {post.feature_image && (
        <img src={post.feature_image} style={{maxWidth: "90%", maxHeight: "400px"}} />
      )}

      <h1>{post.title}</h1>
      <div
        dangerouslySetInnerHTML={{
          __html: post?.html ?? "",
        }}
      />
    </div>
  )
}

GhostPostPage.suppressFirstRenderFlicker = true
GhostPostPage.getLayout = (page) => <GhostLayout title="Read">{page}</GhostLayout>

export default GhostPostPage
