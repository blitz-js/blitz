import Image from 'next/image'
import ViewSource from '../components/view-source'
import mountains from '../public/mountains.jpg'

const PlaceholderBlur = () => (
  <div>
    <ViewSource pathname="pages/placeholder.js" />
    <h1>Image Component With Placeholder Blur</h1>
    <Image
      alt="Mountains"
      src={mountains}
      placeholder="blur"
      width={700}
      height={475}
    />
  </div>
)

export default PlaceholderBlur
