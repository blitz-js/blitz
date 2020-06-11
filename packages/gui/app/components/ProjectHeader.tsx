import {Link} from 'blitz'
import {ArrowNarrowLeftOutline} from 'heroicons-react'
import {FC} from 'react'

import {Project} from 'db'

type ProjectHeaderProps = {
  project: Project
}

export const ProjectHeader: FC<ProjectHeaderProps> = ({project}) => (
  <header className="max-w-6xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
    <div className="pb-2">
      <nav className="flex items-center space-x-2 text-sm font-medium leading-5">
        <ArrowNarrowLeftOutline className="flex-shrink-0 w-5 h-5 text-gray-400" />
        <Link href="/">
          <a className="text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none focus:underline">
            Back to Projects
          </a>
        </Link>
      </nav>
    </div>
    <h2 className="text-2xl font-semibold leading-8 sm:text-3xl sm:leading-9">
      {project.name}
    </h2>
  </header>
)
