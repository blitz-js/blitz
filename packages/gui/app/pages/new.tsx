import {Tabs, TabList, Tab, TabPanels, TabPanel} from '@reach/tabs'
import {BlitzPage, Link} from 'blitz'

import {Sidebar} from 'app/components/Sidebar'

const Header = () => (
  <div className="px-4 py-5 sm:px-6">
    <h3 className="text-lg font-medium leading-6">New Project</h3>
    <p className="max-w-2xl mt-1 text-sm leading-5 text-gray-500">
      Fill out the information below to get started.
    </p>
  </div>
)

const Footer = () => (
  <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
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
)

const Content = () => (
  <ul>
    {[...Array(100)].map((_) => (
      <li>Hello</li>
    ))}
  </ul>
)

const NewPage: BlitzPage = () => (
  <>
    <Sidebar />
    <div className="flex flex-1 sm:px-6 lg:px-8">
      <Tabs className="flex flex-col flex-1 max-w-4xl mx-auto bg-white border-gray-200 divide-y divide-gray-200 sm:border-l sm:border-r">
        <Header />
        <TabList className="flex justify-between -mb-px">
          <Tab>Uno</Tab>
          <Tab>Dos</Tab>
        </TabList>
        <TabPanels className="flex-1 overflow-auto">
          <TabPanel>
            <Content />
          </TabPanel>
          <TabPanel>Dos</TabPanel>
        </TabPanels>
        <Footer />
      </Tabs>
    </div>
  </>
)

export default NewPage
