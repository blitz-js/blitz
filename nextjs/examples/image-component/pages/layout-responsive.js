import Image from 'next/image'
import ViewSource from '../components/view-source'
import mountains from '../public/mountains.jpg'

const Responsive = () => (
  <div>
    <ViewSource pathname="pages/layout-responsive.js" />
    <h1>Image Component With Layout Responsive</h1>
    <Image
      alt="Mountains"
      src={mountains}
      layout="responsive"
      width={700}
      height={475}
    />
  </div>
)

export default Responsive
