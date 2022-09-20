import {useState} from "react"

import {CodeWindow} from "@/components/CodeWindow"
import {useIsDesktop} from "@/hooks/useIsDesktop"

import tokenize from "../../macros/tokenize.macro.js"

const pageTokenized = tokenize.jsx(
  `//---- ON THE CLIENT ----
// app/pages/projects/new.tsx
import { BlitzPage, Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import Layout from "app/core/layouts/Layout"
// Notice how we import the server function directly
import createProject, { CreateProject } from "app/projects/mutations/createProject"
import { ProjectForm } from "app/projects/components/ProjectForm"

const NewProjectPage: BlitzPage = () => {
  const router = useRouter()
  const [createProjectMutation] = useMutation(createProject)

  return (
    <div>
      <h1>Create New Project</h1>

      <ProjectForm
        submitText="Create Project"
        schema={CreateProject}
        onSubmit={async (values) => {
          // This is equivalent to calling the server function directly
          const project = await createProjectMutation(values)
          // Notice the 'Routes' object Blitz provides for routing
          router.push(Routes.ProjectsPage({ projectId: project.id }))
        }}
      />
    </div>
  );
};

NewProjectPage.authenticate = true
NewProjectPage.getLayout = (page) => <Layout>{page}</Layout>

export default NewProjectPage
`,
  true,
)

const mutationTokenized = tokenize.jsx(
  `// ---- ON THE SERVER ----
// app/projects/mutations/createProject.ts
import { resolver } from "@blitzjs/rpc"
import db from "db"
import * as z from "zod"

// This provides runtime validation + type safety
export const CreateProject = z
  .object({
    name: z.string(),
  })

// resolver.pipe is a functional pipe
export default resolver.pipe(
  // Validate the input data
  resolver.zod(CreateProject),
  // Ensure user is logged in
  resolver.authorize(),
  // Perform business logic
  async (input) => {
    const project = await db.project.create({ data: input })
    return project
  }
)`,
  true,
)

const HeroCode = ({className = ""}) => {
  const isDesktop = useIsDesktop()
  const [tabs, setTabs] = useState([
    {
      title: isDesktop ? "mutations/createProject.ts" : "createProject.ts",
      tokens: mutationTokenized.tokens,
      selected: true,
    },
    {
      title: "pages/projects/new.tsx",
      tokens: pageTokenized.tokens,
      selected: false,
    },
  ])
  return (
    <CodeWindow
      className={className}
      tabs={tabs}
      onTabClick={(tabIndex) => {
        setTabs(
          tabs.map((tab, i) => ({
            ...tab,
            selected: i === tabIndex,
          })),
        )
      }}
    >
      <CodeWindow.Code tokens={tabs.find((tab) => tab.selected).tokens} />
    </CodeWindow>
  )
}

export {HeroCode}
