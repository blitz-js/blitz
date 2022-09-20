import ReactPlayer from "react-player/lazy"

const VideoPlayer = ({url, className = ""}) => {
  return (
    <div className="player-wrapper">
      <ReactPlayer
        className={`react-player ${className}`}
        url={url}
        width="100%"
        height="100%"
        controls={true}
        light={true}
      />
    </div>
  )
}

export {VideoPlayer}
