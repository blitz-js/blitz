import React, {Suspense} from "react"
import Layout from "app/layouts/Layout"
import {Head, Link, usePaginatedQuery, useRouter, BlitzPage} from "blitz"
import getSessions from "app/sessions/queries/getSessions"

const ITEMS_PER_PAGE = 100

export const SessionsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{sessions, hasMore}] = usePaginatedQuery(getSessions, {
    orderBy: {id: "asc"},
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({query: {page: page - 1}})
  const goToNextPage = () => router.push({query: {page: page + 1}})

  return (
    <div>
      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            <Link href="/sessions/[sessionId]" as={`/sessions/${session.id}`}>
              <a>{session.name}</a>
            </Link>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const SessionsPage: BlitzPage = () => {
  return (
    <div>
      <Head>
        <title>Sessions</title>
      </Head>

      <main>
        <h1>Sessions</h1>

        <p>
          <Link href="/sessions/new">
            <a>Create Session</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <SessionsList />
        </Suspense>
      </main>
    </div>
  )
}

SessionsPage.getLayout = (page) => <Layout>{page}</Layout>

export default SessionsPage
