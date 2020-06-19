import {FC, Suspense} from "react"

import {Pages} from "./Pages"
import {Schema} from "./Schema"

export const ProjectView: FC = () => (
  <div className="flex-1 max-w-6xl mx-auto overflow-auto sm:py-6 sm:px-6 lg:px-8">
    <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
      <Suspense fallback={null}>
        <Pages />
        <Schema />
      </Suspense>
    </div>
  </div>
)
