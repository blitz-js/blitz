import {useRouter} from "blitz"
import React from "react"

const Post = () => {
  const router = useRouter()

  return (
    <>
      <div id="as-path">{router.asPath}</div>
    </>
  )
}

Post.getInitialProps = () => ({hello: "hi"})

export default Post
