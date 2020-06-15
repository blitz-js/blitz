import {useRouter, useQuery} from 'blitz'
import {FC, FormEvent, useState, Suspense} from 'react'
import {mutate} from 'swr'

import createProject from 'app/mutations/createProject'
import getHomedir from 'app/queries/getHomedir'
import {useColor} from 'utils/useColor'
import {useIcon} from 'utils/useIcon'
import {useName} from 'utils/useName'
import {usePath} from 'utils/usePath'
import {DirectoryChooser} from './DirectoryChooser'
import {Footer} from './Footer'
import {Header} from './Header'
import {Inputs} from './Inputs'
import {Status} from './Status'
import {Tabs} from './Tabs'

export const Form: FC = () => {
  const router = useRouter()

  const [homedir] = useQuery(getHomedir, {})

  const {data: nameData = {name: ''}} = useName()
  const {data: pathData = {path: ''}} = usePath()
  const {data: iconData = {icon: ''}} = useIcon()
  const {data: colorData = {color: ''}} = useColor()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = {
      createdAt: new Date().getTime(),
      name: nameData.name,
      path: `${homedir}/${pathData.path}`,
      icon: iconData.icon,
      color: colorData.color,
      lastActive: 0,
    }

    try {
      const project = await createProject({data})

      if (project) {
        localStorage.setItem('name', JSON.stringify({name: ''}))
        mutate('name', {name: ''})

        localStorage.setItem('path', JSON.stringify({path: ''}))
        mutate('path', {path: ''})

        localStorage.setItem('icon', JSON.stringify({icon: ''}))
        mutate('icon', {icon: ''})

        localStorage.setItem('color', JSON.stringify({color: ''}))
        mutate('color', {color: ''})

        router.push(`/p/${project.id}`)
      } else {
        alert('Something went wrong')
        setIsSubmitting(false)
      }
    } catch {
      alert('Something went wrong')
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col flex-1 max-w-4xl mx-auto bg-white border-gray-200 sm:border-l sm:border-r">
      <Header />
      <Tabs isSubmitting={isSubmitting} />
      <div className="flex-1 overflow-auto">
        <Suspense fallback={null}>
          {isSubmitting ? (
            <Status path={`${homedir}/${pathData.path}`} />
          ) : router.pathname === '/new' ? (
            <Inputs />
          ) : (
            <DirectoryChooser />
          )}
        </Suspense>
      </div>
      <Footer isSubmitting={isSubmitting} />
    </form>
  )
}
