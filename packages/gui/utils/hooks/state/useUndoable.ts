import {useCallback, useRef} from "react"

import {MAX_SMALL_INTEGER} from "./utils"

export const useUndoable = <T>(
  [value, setValue]: [T, React.Dispatch<React.SetStateAction<T>>],
  maxDeltas: number = MAX_SMALL_INTEGER,
): [
  T,
  React.Dispatch<React.SetStateAction<T>>,
  {
    undo: () => void
    redo: () => void
    past: T[]
    future: T[]
    jump: (delta: number) => void
  },
] => {
  const pastValuesRef = useRef<T[]>([])
  const futureValuesRef = useRef<T[]>([])

  const newSetValue = useCallback(
    (update: React.SetStateAction<T>) => {
      setValue((prevValue) => {
        futureValuesRef.current = []
        pastValuesRef.current = [...pastValuesRef.current, prevValue]

        return typeof update === "function" ? (update as (prevValue: T) => T)(prevValue) : update
      })
    },
    [setValue],
  )

  const jump = useCallback(
    (delta: number) => {
      if (delta < 0 && pastValuesRef.current.length >= -delta) {
        setValue((prevValue) => {
          const nextValueIndex = pastValuesRef.current.length + delta
          const nextValue = pastValuesRef.current[nextValueIndex]

          futureValuesRef.current = [
            ...pastValuesRef.current.slice(nextValueIndex + 1),
            prevValue,
            ...futureValuesRef.current,
          ]

          pastValuesRef.current = pastValuesRef.current.slice(0, delta)

          return nextValue
        })
      } else if (delta > 0 && futureValuesRef.current.length >= delta) {
        setValue((prevValue) => {
          const nextValue = futureValuesRef.current[delta - 1]

          pastValuesRef.current = [
            ...pastValuesRef.current,
            prevValue,
            ...futureValuesRef.current.slice(0, delta - 1),
          ]

          futureValuesRef.current = futureValuesRef.current.slice(delta)

          return nextValue
        })
      }
    },
    [setValue],
  )

  const undo = useCallback(() => jump(-1), [jump])

  const redo = useCallback(() => jump(+1), [jump])

  const deltas = pastValuesRef.current.length + futureValuesRef.current.length

  if (deltas > maxDeltas) {
    futureValuesRef.current.splice(maxDeltas - deltas, MAX_SMALL_INTEGER)
    pastValuesRef.current.splice(0, pastValuesRef.current.length - maxDeltas)
  }

  return [
    value,
    newSetValue,
    {
      undo,
      redo,
      past: pastValuesRef.current,
      future: futureValuesRef.current,
      jump,
    },
  ]
}
