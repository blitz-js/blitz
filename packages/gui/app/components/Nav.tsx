import {Link, useRouter} from 'blitz'
import {Plus} from 'heroicons-react'
import {Dispatch, FC, SetStateAction} from 'react'

type NavProps = {
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  openImport: () => void
}

export const Nav: FC<NavProps> = ({setIsModalOpen, openImport}) => {
  const router = useRouter()

  const highlightLink = (pathname: string, target: string) =>
    pathname === target
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-gray-500 hover:text-indigo-600 focus:text-indigo-600'

  return (
    <nav className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link href="/">
            <a className="flex-shrink-0">
              <img className="w-8 h-8" src="/img/logos/blitz-mark-on-white.svg" alt="Blitz logo" />
            </a>
          </Link>
          <div className="hidden md:block">
            <div className="flex items-baseline ml-10">
              <Link href="/">
                <a
                  className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none ${highlightLink(
                    router.pathname,
                    '/',
                  )}`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/">
                <a
                  className={`px-3 py-2 ml-4 text-sm font-medium rounded-md focus:outline-none ${highlightLink(
                    router.pathname,
                    '/settings',
                  )}`}>
                  Settings
                </a>
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="flex items-center ml-4 md:ml-6">
            <span className="rounded-md shadow-sm">
              <button
                onClick={() => setIsModalOpen(true)}
                type="button"
                className="inline-flex items-center px-4 py-2 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700">
                <Plus className="w-5 h-5 mr-2 -ml-1" />
                Create project
              </button>
            </span>
            <button
              onClick={openImport}
              type="button"
              className="ml-5 -mr-20 text-gray-500 font-medium hover:underline">
              or Import
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
