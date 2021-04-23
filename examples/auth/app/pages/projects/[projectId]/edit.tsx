import {Suspense} from "react"
import {Head, Link, useRouter, useQuery, useMutation, useParam, BlitzPage} from "blitz"
import Layout from "app/core/layouts/Layout"
import getProject from "app/projects/queries/getProject"
import updateProject from "app/projects/mutations/updateProject"
import {ProjectForm, FORM_ERROR} from "app/projects/components/ProjectForm"

import {Routes} from ".blitz"

export const EditProject = () => {
  const router = useRouter()
  const projectId = useParam("projectId", "number")
  const [project, {setQueryData}] = useQuery(getProject, {id: projectId})
  const [updateProjectMutation] = useMutation(updateProject)

  return (
    <>
      <Head>
        <title>Edit Project {project.id}</title>
      </Head>

      <div>
        <h1>Edit Project {project.id}</h1>
        <pre>{JSON.stringify(project)}</pre>

        <ProjectForm
          submitText="Update Project"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateProject}
          initialValues={project}
          onSubmit={async (values) => {
            try {
              const updated = await updateProjectMutation({
                id: project.id,
                ...values,
              })
              await setQueryData(updated)
              router.push(`/projects/${updated.id}`)
            } catch (error) {
              console.error(error)
              return {
                [FORM_ERROR]: error.toString(),
              }
            }
          }}
        />
      </div>
    </>
  )
}

const EditProjectPage: BlitzPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditProject />
      </Suspense>

      <p>
        <Link href={Routes.ProjectsPage()}>
          <a>Projects</a>
        </Link>
      </p>
    </div>
  )
}

EditProjectPage.authenticate = true
EditProjectPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditProjectPage
