import {FC} from 'react'

import {PagesModule} from 'app/components/PagesModule'
import {Project} from 'db'

type ProjectModulesProps = {
  project: Project
  projectData: {
    pages: {route: string; link: string}[]
  }
}

export const ProjectModules: FC<ProjectModulesProps> = ({
  project,
  projectData,
}) => (
  <main className="max-w-6xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
    <div className="flex grid flex-wrap grid-cols-1 gap-8 sm:grid-cols-2">
      <PagesModule pages={projectData.pages} />
    </div>
  </main>
)
