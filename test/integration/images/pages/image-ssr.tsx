import {BlitzPage, Image} from "blitz"

export const getServerSideProps = () => {
  return {props: {}}
}

const ImageSSR: BlitzPage = () => {
  return (
    <div>
      <Image
        id="avatar"
        src="https://raw.githubusercontent.com/blitz-js/art/master/github-cover-photo.png"
        alt="blitz.js"
        width={300}
        height={138}
      />
    </div>
  )
}

export default ImageSSR
