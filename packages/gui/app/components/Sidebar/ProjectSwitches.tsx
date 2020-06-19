import {useQuery} from "blitz"
import {FC} from "react"

import getProjects from "app/queries/getProjects"
import {ProjectSwitch} from "./ProjectSwitch"

export const ProjectSwitches: FC = () => {
  const [projects] = useQuery(getProjects, {})

  return (
    <>
      {projects.map((project) => (
        <ProjectSwitch key={project.id} project={project} />
      ))}
    </>
  )
}
