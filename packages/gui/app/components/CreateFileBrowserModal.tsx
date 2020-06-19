import React, {Dispatch, SetStateAction, FC} from "react"
import {FileBrowser} from "./FileBrowser"
import {Fade} from "./Fade"

type CreateFileBrowserModalProps = {
  isModalOpen: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  homedir: string
}

const CreateFileBrowserModal: FC<CreateFileBrowserModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  homedir,
}) => {
  return (
    <Fade show={isModalOpen}>
      <div className="fixed inset-x-0 bottom-0 px-4 pb-4 sm:inset-0 sm:flex sm:items-center sm:justify-center">
        <div onClick={() => setIsModalOpen(false)} className="fixed inset-0">
          <div className="absolute inset-0 bg-gray-500 opacity-75" />
        </div>
        <FileBrowser base={homedir} close={() => setIsModalOpen(false)} />
      </div>
    </Fade>
  )
}

export default CreateFileBrowserModal
