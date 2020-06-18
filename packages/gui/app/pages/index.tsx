import {BlitzPage, useQuery, useRouter} from 'blitz'
import {FC, Suspense, useEffect} from 'react'

import {Sidebar} from 'app/components/Sidebar'
import getProjects from 'app/queries/getProjects'

const Stub: FC = () => {
  const router = useRouter()

  const [projects] = useQuery(getProjects, {})

  useEffect(() => {
    if (projects.length > 0) {
      router.push('/p/[id]', `/p/${projects[0].id}`)
    } else {
      router.push('/new')
    }
  }, [projects])

  return null
}

const HomePage: BlitzPage = () => (
  <>
    <Sidebar />
    <Suspense fallback={null}>
      <Stub />
    </Suspense>
  </>
)

export default HomePage
