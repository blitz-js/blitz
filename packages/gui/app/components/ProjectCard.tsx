import {Link} from 'blitz'
import {ArrowRight, Calendar} from 'heroicons-react'
import {FC} from 'react'

import {Project} from 'db'
import {timeDifference} from 'utils/timeDifference'

type ProjectCardProps = {
  project: Project
  i: number
}

export const ProjectCard: FC<ProjectCardProps> = ({
  project,
  i,
}: ProjectCardProps) => {
  const isFirstCard = i === 0

  return (
    <Link href="/projects/[id]" as={`/projects/${project.id}`}>
      <a>
        <div
          className={`p-6 overflow-hidden rounded-lg ${
            isFirstCard
              ? 'transition duration-150 ease-in-out border-2 border-indigo-600 hover:border-indigo-400 group'
              : 'border border-gray-200'
          }`}>
          <h3
            className={`text-xl font-semibold leading-7 ${
              isFirstCard
                ? 'text-indigo-600 transition duration-150 ease-in-out group-hover:text-indigo-500'
                : ''
            }`}>
            {project.name}
          </h3>
          <p className="mt-3 text-base leading-6 text-gray-500">
            {project.description}
          </p>
          {isFirstCard ? (
            <div className="flex items-center mt-3 text-sm font-semibold leading-5 text-indigo-600 transition duration-150 ease-in-out group-hover:text-indigo-500">
              Continue building
              <ArrowRight className="flex-shrink-0 ml-1.5 h-5 w-5 group-hover:text-indigo-500" />
            </div>
          ) : (
            <div className="flex items-center mt-3 text-sm leading-5 text-gray-500">
              <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              Last edited{' '}
              {timeDifference(new Date().getTime(), project.lastActive)}
            </div>
          )}
        </div>
      </a>
    </Link>
  )
}
