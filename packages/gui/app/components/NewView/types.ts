import {Dispatch, SetStateAction} from 'react'

import getDirectories from 'app/queries/getDirectories'

export type ColorProps = {
  color: string
}

type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown
}
  ? U
  : T

export type Directory = Await<ReturnType<typeof getDirectories>>[0]

export type DirectoryListProps = {
  currentPath: string
  setCurrentPath: Dispatch<SetStateAction<string>>
}

export type IconProps = {
  icon: string
}

export type FooterProps = {
  isSubmitting: boolean
}

export type StatusProps = {
  path: string
}

export type TabsProps = {
  isSubmitting: boolean
}
