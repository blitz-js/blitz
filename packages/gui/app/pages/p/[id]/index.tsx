import {BlitzPage} from 'blitz'

import {ProjectView} from 'app/components/ProjectView'
import {Sidebar} from 'app/components/Sidebar'

const ProjectPage: BlitzPage = () => (
  <>
    <Sidebar />
    <ProjectView />
  </>
)

export default ProjectPage
