import Image from 'next/image'
import ViewSource from '../components/view-source'
import mountains from '../public/mountains.jpg'

const Fixed = () => (
  <div>
    <ViewSource pathname="pages/layout-fixed.js" />
    <h1>Image Component With Layout Fixed</h1>
    <Image
      alt="Mountains"
      src={mountains}
      layout="fixed"
      width={700}
      height={475}
    />
  </div>
)

export default Fixed
