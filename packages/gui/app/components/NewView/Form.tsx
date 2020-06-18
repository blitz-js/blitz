import {useRouter, useQuery} from 'blitz'
import {FC, FormEvent, useState, Suspense} from 'react'
import {mutate} from 'swr'

import createProject from 'app/mutations/createProject'
import importProject from 'app/mutations/importProject'
import getHomedir from 'app/queries/getHomedir'
import {findClosestStringMatch} from 'utils/string/findClosestStringMatch'
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
import {colors, icons} from './utils'

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

    const isNew = router.pathname === '/new'

    const data = {
      createdAt: new Date().getTime(),
      name: nameData.name,
      path: isNew ? `${homedir}/${pathData.path}` : pathData.path,
      icon: isNew ? iconData.icon : findClosestStringMatch(nameData.name, icons) || 'CodeOutline',
      color: isNew ? colorData.color : colors[(Math.random() * colors.length) | 0],
      lastActive: 0,
    }

    try {
      const command = isNew ? createProject : importProject
      const project = await command({data})

      if (project) {
        localStorage.setItem('name', JSON.stringify({name: ''}))
        mutate('name', {name: ''})

        localStorage.setItem('path', JSON.stringify({path: ''}))
        mutate('path', {path: ''})

        localStorage.setItem('icon', JSON.stringify({icon: ''}))
        mutate('icon', {icon: ''})

        localStorage.setItem('color', JSON.stringify({color: ''}))
        mutate('color', {color: ''})

        router.push('/p/[id]', `/p/${project.id}`)
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
