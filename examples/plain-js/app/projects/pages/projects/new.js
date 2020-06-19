import {Head, Link, useRouter} from "blitz"
import createProject from "app/projects/mutations/createProject"

const NewProjectPage = () => {
  const router = useRouter()
  return (
    <div>
      <Head>
        <title>New Project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Create New Project </h1>

        <form
          onSubmit={async (event) => {
            event.preventDefault()

            try {
              const project = await createProject({
                data: {
                  name: "MyName",
                },
              })
              alert("Success!" + JSON.stringify(project))
              router.push("/projects/[id]", `/projects/${project.id}`)
            } catch (error) {
              alert("Error creating project " + JSON.stringify(error, null, 2))
            }
          }}
        >
          <div>Put your form fields here. But for now, just click submit</div>
          <button>Submit</button>
        </form>

        <p>
          <Link href="/projects">
            <a>Projects</a>
          </Link>
        </p>
      </main>
    </div>
  )
}

export default NewProjectPage
