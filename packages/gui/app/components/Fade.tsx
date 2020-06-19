import {FC, ReactNode} from "react"

import {useDelayUnmount} from "utils/hooks/web/useDelayUnmount"

type FadeProps = {
  show: boolean
  children: ReactNode
}

export const Fade: FC<FadeProps> = ({show, children}) => {
  const shouldRenderChild = useDelayUnmount(show, 300)
  const mountedStyle = {animation: "fadein 300ms ease-in"}
  const unmountedStyle = {animation: "fadeout 310ms ease-in"}

  return (
    <>
      <style>{`
        @keyframes fadein {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeout {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>
      {shouldRenderChild && <div style={show ? mountedStyle : unmountedStyle}>{children}</div>}
    </>
  )
}
