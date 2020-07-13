import {Link} from "blitz"
import {FC, Suspense} from "react"

import {NewSwitch} from "./NewSwitch"
import {ProjectSwitches} from "./ProjectSwitches"

export const Sidebar: FC = () => (
  <div className="flex flex-col w-20 overflow-auto bg-white border-r border-gray-200 divide-y divide-gray-200">
    <div className="flex justify-center py-4">
      <Link href="/">
        <a>
          <img src="/img/logos/blitz-mark-on-white.svg" alt="blitz" className="w-5 h-auto" />
        </a>
      </Link>
    </div>
    <nav className="flex-1 py-2">
      <Suspense fallback={null}>
        <ProjectSwitches />
      </Suspense>
    </nav>
    <div className="pt-2">
      <NewSwitch />
    </div>
  </div>
)
