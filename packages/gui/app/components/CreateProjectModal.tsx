import {Dispatch, SetStateAction} from 'react'

import {CreateProjectForm} from 'app/components/CreateProjectForm'
import {Transition} from 'app/components/Transition'

type CreateProjectModalProps = {
  isModalOpen: boolean
  homedir: string
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
}

export const CreateProjectModal = ({isModalOpen, homedir, setIsModalOpen}: CreateProjectModalProps) => (
  <Transition show={isModalOpen} appear={true}>
    <div className="fixed inset-x-0 bottom-0 px-4 pb-4 sm:inset-0 sm:flex sm:items-center sm:justify-center">
      <Transition
        show={isModalOpen}
        appear={true}
        enter="transition-opacity ease-linear duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0">
        <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75" />
        </div>
      </Transition>
      <Transition
        show={isModalOpen}
        appear={true}
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enterTo="opacity-100 translate-y-0 sm:scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
        <CreateProjectForm homedir={homedir} setIsModalOpen={setIsModalOpen} />
      </Transition>
    </div>
  </Transition>
)
