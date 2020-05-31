import {FC} from 'react'

import {ConsoleModule} from 'app/components/ConsoleModule'

export const ProjectModules: FC = () => (
  <main className="max-w-6xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
    <div className="flex grid flex-wrap grid-cols-1 gap-8 sm:grid-cols-2">
      <ConsoleModule />
    </div>
  </main>
)
