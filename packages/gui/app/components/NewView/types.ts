import {Dispatch, SetStateAction} from 'react'

export type DirectoryListProps = {
  path: string
  setPath: Dispatch<SetStateAction<string>>
}
