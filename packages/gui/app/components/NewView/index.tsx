import {FC, Suspense} from 'react'

import {Form} from './Form'

export const NewView: FC = () => (
  <div className="flex flex-1 sm:px-6 lg:px-8">
    <Suspense
      fallback={
        <div className="flex flex-col flex-1 max-w-4xl mx-auto bg-white border-gray-200 sm:border-l sm:border-r" />
      }>
      <Form />
    </Suspense>
  </div>
)
