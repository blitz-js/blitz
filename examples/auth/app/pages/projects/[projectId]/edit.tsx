import {Suspense} from "react"
import {Link, useRouter, useQuery, useMutation, useParam, BlitzPage} from "blitz"
import Layout from "app/core/layouts/Layout"
import getProject from "app/projects/queries/getProject"
import updateProject from "app/projects/mutations/updateProject"
import ProjectForm from "app/projects/components/ProjectForm"

export const EditProject = () => {
  const router = useRouter()
  const projectId = useParam("projectId", "number")
  const [project, {setQueryData}] = useQuery(getProject, {where: {id: projectId}})
  const [updateProjectMutation] = useMutation(updateProject)

  return (
    <div>
      <h1>Edit Project {project.id}</h1>
      <pre>{JSON.stringify(project)}</pre>

      <ProjectForm
        initialValues={project}
        onSubmit={async () => {
          try {
            const updated = await updateProjectMutation({
              where: {id: project.id},
              data: {name: "MyNewName"},
            })
            await setQueryData(updated)
            alert("Success!" + JSON.stringify(updated))
            router.push(`/projects/${updated.id}`)
          } catch (error) {
            console.log(error)
            alert("Error editing project " + JSON.stringify(error, null, 2))
          }
        }}
      />
    </div>
  )
}

const EditProjectPage: BlitzPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditProject />
      </Suspense>

      <p>
        <Link href="/projects">
          <a>Projects</a>
        </Link>
      </p>
    </div>
  )
}

EditProjectPage.getLayout = (page) => <Layout title={"Edit Project"}>{page}</Layout>

export default EditProjectPage
