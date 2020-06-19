import {Dispatch, FC, SetStateAction} from "react"

import {CreateProjectForm} from "app/components/CreateProjectForm"
import {Fade} from "app/components/Fade"

type CreateProjectModalProps = {
  isModalOpen: boolean
  homedir: string
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
}

export const CreateProjectModal: FC<CreateProjectModalProps> = ({
  isModalOpen,
  homedir,
  setIsModalOpen,
}) => (
  <Fade show={isModalOpen}>
    <div className="fixed inset-x-0 bottom-0 px-4 pb-4 sm:inset-0 sm:flex sm:items-center sm:justify-center">
      <div onClick={() => setIsModalOpen(false)} className="fixed inset-0">
        <div className="absolute inset-0 bg-gray-500 opacity-75" />
      </div>
      <CreateProjectForm homedir={homedir} setIsModalOpen={setIsModalOpen} />
    </div>
  </Fade>
)
