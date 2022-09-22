import {useState, useEffect} from "react"
import dynamic from "next/dynamic"
const ReactPlayer = dynamic(() => import("react-player/lazy"), {
  suspense: false,
})

const VideoPlayer = ({url, className = ""}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="player-wrapper">
      {mounted ? (
        <ReactPlayer
          className={`react-player ${className}`}
          url={url}
          width="100%"
          height="100%"
          controls={true}
          light={true}
        />
      ) : null}
    </div>
  )
}

export {VideoPlayer}
