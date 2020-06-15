import {BlitzPage, useParam, useQuery} from 'blitz'
import {FC, Suspense, useEffect} from 'react'

import {Sidebar} from 'app/components/Sidebar'
import getProject from 'app/queries/getProject'

const Stub: FC = () => {
  const id = useParam('id', 'string')

  const [project] = useQuery(getProject, {where: {id}})

  return <h1>{project?.name}</h1>
}

const ProjectPage: BlitzPage = () => (
  <>
    <Sidebar />
    <Suspense fallback={<h1>loading...</h1>}>
      <Stub />
    </Suspense>
  </>
)

export default ProjectPage
