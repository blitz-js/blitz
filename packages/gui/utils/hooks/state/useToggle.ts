import {useCallback} from 'react'

export const useToggle = ([value, setValue]: [boolean, React.Dispatch<React.SetStateAction<boolean>>]): [
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
  () => void,
] => {
  const toggleValue = useCallback(() => {
    setValue((prevValue) => !prevValue)
  }, [setValue])

  return [value, setValue, toggleValue]
}
