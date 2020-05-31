import {FC} from 'react'

export const ConsoleModule: FC = () => (
  <div className="flex flex-col overflow-hidden border border-gray-200 rounded-lg">
    <div className="flex-shrink-0">
      <div className="h-32 bg-gray-900"></div>
    </div>
    <div className="flex flex-col justify-between flex-1 p-6">
      <div className="flex-1">
        <p className="text-sm font-medium leading-5 text-indigo-600">Blog</p>
        <h3 className="mt-2 text-xl font-semibold leading-7">Name</h3>
        <p className="mt-3 leading-6 text-gray-600">Seomthing else</p>
      </div>
    </div>
  </div>
)
