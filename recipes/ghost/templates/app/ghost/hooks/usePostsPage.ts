import {PostsOrPages} from "@tryghost/content-api"
import {useQuery} from "@blitzjs/rpc"
import getPosts from "../queries/getPosts"

const usePostsPage = (page: number, limit: number): [PostsOrPages, boolean] => {
  const [posts] = useQuery(
    getPosts,
    {
      page,
      limit,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const [nextPosts] = useQuery(
    getPosts,
    {
      page: page + 1,
      limit,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const hasNext = nextPosts.length > 0

  return [posts, hasNext]
}

export default usePostsPage
