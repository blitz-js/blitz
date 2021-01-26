import {Link, useRouter, useMutation, BlitzPage} from "blitz"
import Layout from "app/core/layouts/Layout"
import createProject from "app/projects/mutations/createProject"
import ProjectForm from "app/projects/components/ProjectForm"

const NewProjectPage: BlitzPage = () => {
  const router = useRouter()
  const [createProjectMutation] = useMutation(createProject)

  return (
    <div>
      <h1>Create New Project</h1>

      <ProjectForm
        initialValues={{}}
        onSubmit={async () => {
          try {
            const project = await createProjectMutation({name: "MyName"})
            alert("Success!" + JSON.stringify(project))
            router.push(`/projects/${project.id}`)
          } catch (error) {
            alert("Error creating project " + JSON.stringify(error, null, 2))
          }
        }}
      />

      <p>
        <Link href="/projects">
          <a>Projects</a>
        </Link>
      </p>
    </div>
  )
}

NewProjectPage.getLayout = (page) => <Layout title={"Create New Project"}>{page}</Layout>

export default NewProjectPage
