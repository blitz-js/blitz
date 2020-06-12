import {Tabs, TabList, Tab, TabPanels, TabPanel} from '@reach/tabs'
import {Link} from 'blitz'
import {FC, useState} from 'react'

import {DirectoryChooser} from './DirectoryChooser'
import {Form} from './Form'

export const NewView: FC = () => {
  const [tabIndex, setTabIndex] = useState(0)

  const handleTabsChange = (index: number) => {
    setTabIndex(index)
  }

  return (
    <div className="flex flex-col flex-1 max-w-4xl mx-auto sm:px-6 lg:px-8">
      <div className="flex flex-col flex-1 bg-white border-gray-200 sm:border-l sm:border-r">
        <div className="flex flex-col flex-1">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6">New Project</h3>
            <p className="max-w-2xl mt-1 text-sm leading-5 text-gray-500">
              Fill out the information below to get started.
            </p>
          </div>
          <Tabs className="flex flex-col flex-1 overflow-auto" index={tabIndex} onChange={handleTabsChange}>
            <div className="border-b border-gray-200">
              <TabList className="flex justify-between -mb-px">
                <Tab
                  className={`w-full py-4 text-sm font-medium leading-5 text-center whitespace-no-wrap transition duration-150 ease-in-out border-b-2 border-r focus:outline-none ${
                    tabIndex === 1
                      ? 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
                      : 'text-indigo-600 border-indigo-500 focus:text-indigo-800 focus:border-indigo-700'
                  }`}
                  style={{borderRightColor: '#e5e7eb'}}>
                  Create new
                </Tab>
                <Tab
                  className={`w-full py-4 text-sm font-medium leading-5 text-center whitespace-no-wrap transition duration-150 ease-in-out border-b-2 focus:outline-none ${
                    tabIndex === 0
                      ? 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
                      : 'text-indigo-600 border-indigo-500 focus:text-indigo-800 focus:border-indigo-700'
                  }`}>
                  Import existing project
                </Tab>
              </TabList>
            </div>
            <TabPanels className="flex flex-col flex-1 ">
              <TabPanel>
                <Form />
              </TabPanel>
              <TabPanel>
                <DirectoryChooser />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 sm:px-6 sm:flex sm:flex-row-reverse">
          <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
            <button
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium leading-6 text-white transition duration-150 ease-in-out bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo sm:text-sm sm:leading-5">
              Create project
            </button>
          </span>
          <span className="flex w-full mt-3 rounded-md shadow-sm sm:mt-0 sm:w-auto">
            <Link href="/">
              <a className="inline-flex justify-center w-full px-4 py-2 text-base font-medium leading-6 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue sm:text-sm sm:leading-5">
                Cancel
              </a>
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}
