import { FC } from 'react'
import { useSelector } from 'react-redux'

import { selectClock } from '../lib/slices/clockSlice'

const formatTime = (time: number) => {
  // cut off except hh:mm:ss
  return new Date(time).toJSON().slice(11, 19)
}

const Clock: FC = () => {
  const { lastUpdate, light } = useSelector(selectClock)

  return (
    <div className={light ? 'light' : ''}>
      {formatTime(lastUpdate)}
      <style jsx>{`
        div {
          padding: 15px;
          display: inline-block;
          color: #82fa58;
          font: 50px menlo, monaco, monospace;
          background-color: #000;
        }

        .light {
          background-color: #999;
        }
      `}</style>
    </div>
  )
}

export default Clock
