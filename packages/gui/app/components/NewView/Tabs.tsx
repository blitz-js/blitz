import {Link, useRouter} from 'blitz'
import {FC} from 'react'

export const Tabs: FC = () => {
  const router = useRouter()

  return (
    <div className="border-b border-gray-200">
      <nav className="flex justify-between -mb-px">
        <Link href="/new">
          <a
            className={`w-full py-4 text-sm font-medium leading-5 text-center whitespace-no-wrap transition duration-150 ease-in-out border-b-2 border-r focus:outline-none ${
              router.pathname === '/import'
                ? 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
                : 'text-indigo-600 border-indigo-500 focus:text-indigo-800 focus:border-indigo-700'
            }`}
            style={{borderRightColor: '#e5e7eb'}}>
            Create new
          </a>
        </Link>
        <Link href="/import">
          <a
            className={`w-full py-4 text-sm font-medium leading-5 text-center whitespace-no-wrap transition duration-150 ease-in-out border-b-2 focus:outline-none ${
              router.pathname === '/new'
                ? 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
                : 'text-indigo-600 border-indigo-500 focus:text-indigo-800 focus:border-indigo-700'
            }`}>
            Import existing project
          </a>
        </Link>
      </nav>
    </div>
  )
}
