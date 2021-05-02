import Image from 'next/image'
import React from 'react'

const Page = () => {
  return (
    <div>
      <p>Hello World</p>
      <div style={{ visibility: 'hidden' }}>
        <Image
          id="hidden-image"
          src="/test.jpg"
          width="400"
          height="400"
        ></Image>
      </div>
      <p id="stubtext">This is the hidden parent page</p>
    </div>
  )
}

export default Page
