import {BlitzPage, GetServerSideProps} from 'blitz'
import Error from 'next/error'
import {homedir} from 'os'
import {useState} from 'react'

import {Nav} from 'app/components/Nav'
import {CreateProjectModal} from 'app/components/CreateProjectModal'
import {ProjectHeader} from 'app/components/ProjectHeader'
import {ProjectModules} from 'app/components/ProjectModules'
import getProject from 'app/queries/getProject'
import {Project} from 'db'

type ShowProjectPageProps = {
  project: Project | null
  homedir: string
}

export const getServerSideProps: GetServerSideProps<ShowProjectPageProps> = async ({query}) => {
  const id = String(query.id)
  const project = await getProject({where: {id}})

  return {
    props: {project, homedir: homedir()},
  }
}

const ShowProjectPage: BlitzPage<ShowProjectPageProps> = ({project, homedir}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!project) {
    return <Error statusCode={404} />
  }

  return (
    <>
      <CreateProjectModal isModalOpen={isModalOpen} homedir={homedir} setIsModalOpen={setIsModalOpen} />
      <Nav setIsModalOpen={setIsModalOpen} />
      <ProjectHeader project={project} />
      <ProjectModules />
    </>
  )
}

export default ShowProjectPage
