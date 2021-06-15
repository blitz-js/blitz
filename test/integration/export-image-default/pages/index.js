import {Image} from "blitz"

export default function ImageDefault() {
  return (
    <div>
      <p>Should error during export</p>
      <Image src="/i.png" width="10" height="10" />
    </div>
  )
}
