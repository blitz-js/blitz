import {useRouter} from 'blitz'
import {FC, Suspense} from 'react'

import {useLocalStorage} from 'utils/hooks/web/useLocalStorage'
import {DirectoryChooser} from './DirectoryChooser'
import {Footer} from './Footer'
import {Header} from './Header'
import {Inputs} from './Inputs'
import {Tabs} from './Tabs'

export const NewView: FC = () => {
  const router = useRouter()

  const [name, setName] = useLocalStorage<string>('name', '')
  const [path, setPath] = useLocalStorage<string>('path', '')

  return (
    <div className="flex flex-1 sm:px-6 lg:px-8">
      <form className="flex flex-col flex-1 max-w-4xl mx-auto bg-white border-gray-200 sm:border-l sm:border-r">
        <Header />
        <Tabs />
        <div className="flex-1 overflow-auto">
          {router.pathname === '/new' ? (
            <Inputs />
          ) : (
            <Suspense fallback={null}>
              <DirectoryChooser />
            </Suspense>
          )}
        </div>
        <Footer />
      </form>
    </div>
  )
}
