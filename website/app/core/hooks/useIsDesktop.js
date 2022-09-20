import {useMedia} from "@/hooks/useMedia"

export const useIsDesktop = () => {
  const matches = useMedia("(min-width: 1024px)")
  return matches
}
