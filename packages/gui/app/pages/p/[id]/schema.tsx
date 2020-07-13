import {BlitzPage, useParam, useQuery} from "blitz"
import {motion} from "framer-motion"
import {FC, useRef, Suspense} from "react"

import getProject from "app/queries/getProject"
import getSchema from "app/queries/getSchema"

const SchemaView: FC = () => {
  const id = useParam("id", "string")

  const constraintsRef = useRef(null)

  const [project] = useQuery(getProject, {where: {id}})

  if (!project) {
    return null
  }

  // eslint-disable-next-line
  const [schema] = useQuery(getSchema, {path: project.path})

  if (!schema) {
    return null
  }

  return (
    <div ref={constraintsRef} className="flex-1 max-w-6xl px-4 py-5 mx-auto sm:px-6 lg:px-8">
      {schema.models.map((model) => (
        <motion.div
          drag={true}
          dragConstraints={constraintsRef}
          dragMomentum={false}
          className="w-1/2 overflow-hidden bg-white border border-gray-200 rounded-lg "
        >
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6">{model.name}</h3>
          </div>
          <dl className="divide-y divide-gray-200">
            {model.fields.map((field) => (
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium leading-5 text-gray-500">{field.name}</dt>
                <dd className="mt-1 text-sm leading-5 sm:mt-0 sm:col-span-2">{field.type}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      ))}
    </div>
  )
}

const SchemaPage: BlitzPage = () => {
  return (
    <>
      <div />
      <Suspense fallback={null}>
        <SchemaView />
      </Suspense>
    </>
  )
}

export default SchemaPage
