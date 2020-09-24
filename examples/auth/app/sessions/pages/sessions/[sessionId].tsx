import React, {Suspense} from "react"
import Layout from "app/layouts/Layout"
import {Head, Link, useRouter, useQuery, useParam, BlitzPage} from "blitz"
import getSession from "app/sessions/queries/getSession"
import deleteSession from "app/sessions/mutations/deleteSession"

export const Session = () => {
  const router = useRouter()
  const sessionId = useParam("sessionId", "number")
  const [session] = useQuery(getSession, {where: {id: sessionId}})

  return (
    <div>
      <h1>Session {session.id}</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>

      <Link href="/sessions/[sessionId]/edit" as={`/sessions/${session.id}/edit`}>
        <a>Edit</a>
      </Link>

      <button
        type="button"
        onClick={async () => {
          if (window.confirm("This will be deleted")) {
            await deleteSession({where: {id: session.id}})
            router.push("/sessions")
          }
        }}
      >
        Delete
      </button>
    </div>
  )
}

const ShowSessionPage: BlitzPage = () => {
  return (
    <div>
      <Head>
        <title>Session</title>
      </Head>

      <main>
        <p>
          <Link href="/sessions">
            <a>Sessions</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <Session />
        </Suspense>
      </main>
    </div>
  )
}

ShowSessionPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowSessionPage
