import {useInput} from "ink"

export function useEnterToContinue(cb: Function, additionalCondition: boolean = true) {
  useInput((_input, key) => {
    if (additionalCondition && key.return) {
      cb()
    }
  })
}
