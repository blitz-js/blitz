import {useRouter} from 'blitz'
import {Dispatch, FormEvent, SetStateAction, Suspense, useState} from 'react'

import {CreateProjectInputs} from 'app/components/CreateProjectInputs'
import {CreateProjectStatus} from 'app/components/CreateProjectStatus'
import createProject from 'app/mutations/createProject'
import {useLocalStorage} from 'utils/hooks/web/useLocalStorage'

type CreateProjectFormProps = {
  homedir: string
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
}

export const CreateProjectForm = ({homedir, setIsModalOpen}: CreateProjectFormProps) => {
  const router = useRouter()
  const [name, setName] = useLocalStorage<string>('name', '')
  const [description, setDescription] = useLocalStorage<string>('description', '')
  const [path, setPath] = useLocalStorage<string>('path', 'projects/')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = {name, path: `${homedir}/${path}`, description, lastActive: new Date().getTime()}

    try {
      const project = await createProject({data})

      if (project) {
        setName('')
        setDescription('')
        setPath('')
        router.push(`/projects/${project.id}`)
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
      className="overflow-hidden transition-all transform bg-white rounded-lg shadow-xl sm:max-w-xl sm:w-full"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline">
      <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
        {isSubmitting ? (
          <Suspense fallback={null}>
            <CreateProjectStatus path={`${homedir}/${path}`} />
          </Suspense>
        ) : (
          <CreateProjectInputs
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            homedir={homedir}
            path={path}
            setPath={setPath}
          />
        )}
      </div>
      <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
        <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
          <button
            type="submit"
            className="inline-flex justify-center w-full px-4 py-2 text-base font-medium leading-6 text-white transition duration-150 ease-in-out bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo sm:text-sm sm:leading-5 disabled:opacity-50"
            disabled={isSubmitting}>
            Create
          </button>
        </span>
        <span className="flex w-full mt-3 rounded-md shadow-sm sm:mt-0 sm:w-auto">
          <button
            onClick={() => setIsModalOpen(false)}
            type="button"
            className="inline-flex justify-center w-full px-4 py-2 text-base font-medium leading-6 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue sm:text-sm sm:leading-5">
            Cancel
          </button>
        </span>
      </div>
    </form>
  )
}
