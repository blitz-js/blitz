import {useStdin} from "ink"
import {RecipeCLIFlags} from "../types"

export function useUserInput(cliFlags: RecipeCLIFlags) {
  const {isRawModeSupported} = useStdin()
  return isRawModeSupported && !cliFlags.yesToAll
}
