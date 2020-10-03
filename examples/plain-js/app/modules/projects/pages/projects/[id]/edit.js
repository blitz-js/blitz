import updateProject from "app/modules/projects/mutations/updateProject"
import getProject from "app/modules/projects/queries/getProject"
import {Head, Link, useQuery, useRouter} from "blitz"
import {Suspense} from "react"
export const EditProject = () => {
  const router = useRouter()
  const id = parseInt(router?.query.id)
  const [project] = useQuery(getProject, {
    where: {
      id,
    },
  })
  return (
    <div>
      <h1>Edit Project {project.id}</h1>
      <pre>{JSON.stringify(project)}</pre>

      <form
        onSubmit={async (event) => {
          event.preventDefault()

          try {
            const updated = await updateProject({
              where: {
                id: project.id,
              },
              data: {
                name: "MyNewName",
              },
            })
            alert("Success!" + JSON.stringify(updated))
            router.push("/projects/[id]", `/projects/${updated.id}`)
          } catch (error) {
            alert("Error creating project " + JSON.stringify(error, null, 2))
          }
        }}
      >
        <div>Put your form fields here. But for now, just click submit</div>
        <button>Submit</button>
      </form>
    </div>
  )
}

const EditProjectPage = () => {
  return (
    <div>
      <Head>
        <title>Edit Project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <EditProject />
        </Suspense>

        <p>
          <Link href="/projects">
            <a>Projects</a>
          </Link>
        </p>
      </main>
    </div>
  )
}

export default EditProjectPage
