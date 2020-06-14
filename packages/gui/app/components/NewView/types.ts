import {Dispatch, DispatchWithoutAction, SetStateAction} from 'react'

export type Directory = {
  name: string
  path: string
  isBlitz: boolean
}

export type DirectoryListProps = {
  currentPath: string
  setCurrentPath: Dispatch<SetStateAction<string>>
}
