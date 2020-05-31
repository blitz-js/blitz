import {BlitzPage, GetServerSideProps} from 'blitz'
import {homedir} from 'os'
import {useState} from 'react'

import {CreateProjectModal} from 'app/components/CreateProjectModal'
import {Greeting} from 'app/components/Greeting'
import {Nav} from 'app/components/Nav'
import {ProjectList} from 'app/components/ProjectList'
import getProjects from 'app/queries/getProjects'
import {Project} from 'db'

type ProjectsPageProps = {
  projects: Project[]
  homedir: string
}

export const getServerSideProps: GetServerSideProps<ProjectsPageProps> = async () => {
  const projects = await getProjects({})

  return {
    props: {projects, homedir: homedir()},
  }
}

const ProjectPage: BlitzPage<ProjectsPageProps> = ({projects, homedir}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <CreateProjectModal isModalOpen={isModalOpen} homedir={homedir} setIsModalOpen={setIsModalOpen} />
      <Nav setIsModalOpen={setIsModalOpen} />
      <Greeting />
      <ProjectList projects={projects} />
    </>
  )
}

export default ProjectPage
