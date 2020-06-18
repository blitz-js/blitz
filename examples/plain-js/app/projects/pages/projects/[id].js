import {Suspense} from "react"
import {Head, Link, useRouter, useQuery} from "blitz"
import getProject from "app/projects/queries/getProject"
import deleteProject from "app/projects/mutations/deleteProject"
export const Project = () => {
  const router = useRouter()
  const id = parseInt(router?.query.id)
  const [project] = useQuery(getProject, {
    where: {
      id,
    },
  })
  return (
    <div>
      <h1>Project {project.id}</h1>
      <pre>{JSON.stringify(project)}</pre>

      <Link href="/projects/[id]/edit" as={`/projects/${project.id}/edit`}>
        <a>Edit</a>
      </Link>

      <button
        type="button"
        onClick={async () => {
          if (window.confirm("This will be deleted")) {
            await deleteProject({
              where: {
                id: project.id,
              },
            })
            router.push("/projects")
          }
        }}
      >
        Delete
      </button>
    </div>
  )
}

const ShowProjectPage = () => {
  return (
    <div>
      <Head>
        <title>Project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>
          <Link href="/projects">
            <a>Projects</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <Project />
        </Suspense>
      </main>
    </div>
  )
}

export default ShowProjectPage
