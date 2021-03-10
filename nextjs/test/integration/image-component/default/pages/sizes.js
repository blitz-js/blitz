import React from 'react'
import Image from 'next/image'

const Page = () => {
  return (
    <div>
      <p>Assign sizes prop</p>
      <Image
        id="sizes1"
        src="/wide.png"
        width="1200"
        height="700"
        sizes="(max-width: 2048px) 1200px, 3840px"
      />
      <p>Assign sizes prop</p>
    </div>
  )
}

export default Page
