import {BlitzPage, GetServerSideProps} from 'blitz'
import {homedir} from 'os'
import {useState} from 'react'

import {CreateProjectModal} from 'app/components/CreateProjectModal'
import {Header} from 'app/components/Header'
import {Nav} from 'app/components/Nav'
import {ProjectList} from 'app/components/ProjectList'
import getProjects from 'app/queries/getProjects'
import {Project} from 'db'

type IndexPageProps = {
  projects: Project[]
  homedir: string
}

export const getServerSideProps: GetServerSideProps<IndexPageProps> = async () => {
  const projects = await getProjects({})

  return {
    props: {projects, homedir: homedir()},
  }
}

const IndexPage: BlitzPage<IndexPageProps> = ({projects, homedir}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Nav setIsModalOpen={setIsModalOpen} />
      <Header />
      <ProjectList projects={projects} />
      <CreateProjectModal isModalOpen={isModalOpen} homedir={homedir} setIsModalOpen={setIsModalOpen} />
    </>
  )
}

export default IndexPage
