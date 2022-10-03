import {BlitzPage, Routes} from "@blitzjs/next"
import Link from "next/link"
import GhostLayout from "app/ghost/layouts/GhostLayout"
import usePostsPage from "app/ghost/hooks/usePostsPage"

/*
 * This file is just for a very basic demonstration of using ghost with blitz.
 */
const GhostIndex: BlitzPage = () => {
  const [posts] = usePostsPage(1, 5)

  return (
    <div>
      {posts.map(
        ({id, slug, feature_image: featureImage, title, custom_excerpt = undefined, excerpt}) => (
          <div key={id}>
            {featureImage && (
              <div className="image-card">
                <Link prefetch={true} href={Routes.GhostPostPage({slug})}>
                  <a>
                    <img loading="lazy" src={featureImage} />
                  </a>
                </Link>
              </div>
            )}
            <b>{title}</b>
            <p>{custom_excerpt ?? excerpt}</p>
            <Link prefetch={true} href={Routes.GhostPostPage({slug})}>
              <a>Read More...</a>
            </Link>

            <hr />
          </div>
        ),
      )}

      <footer>
        <a
          href="https://blitzjs.com?utm_source=blitz-new&utm_medium=app-template&utm_campaign=blitz-new"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by <a href="https://blitzjs.com/">Blitz.js</a> &amp;{" "}
          <a href="https://github.com/tryghost/ghost">Ghost</a>
        </a>
      </footer>
    </div>
  )
}

GhostIndex.suppressFirstRenderFlicker = true
GhostIndex.getLayout = (page) => <GhostLayout title="Home">{page}</GhostLayout>

export default GhostIndex
