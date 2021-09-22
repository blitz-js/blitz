import {Suspense} from "react"
import {Head, Link, useRouter, useQuery, useParam, BlitzPage, useMutation} from "blitz"
import Layout from "app/core/layouts/Layout"
import getProject from "app/projects/queries/getProject"
import deleteProject from "app/projects/mutations/deleteProject"

import {Routes} from ".blitz"

export const Project = () => {
  const router = useRouter()
  const projectId = useParam("projectId", "number")
  const [deleteProjectMutation, {isSuccess}] = useMutation(deleteProject)
  const [project] = useQuery(getProject, {id: projectId}, {enabled: !isSuccess})

  if (!project) return null

  return (
    <>
      <Head>
        <title>Project {project.id}</title>
      </Head>

      <div>
        <h1>Project {project.id}</h1>
        <pre>{JSON.stringify(project, null, 2)}</pre>

        <Link href={Routes.EditProjectPage({projectId: project.id})}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteProjectMutation({id: project.id})
              router.push("/projects")
            }
          }}
          style={{marginLeft: "0.5rem"}}
        >
          Delete
        </button>
      </div>
    </>
  )
}

const ShowProjectPage: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.ProjectsPage()}>
          <a>Projects</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Project />
      </Suspense>
    </div>
  )
}

ShowProjectPage.authenticate = true
ShowProjectPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowProjectPage
