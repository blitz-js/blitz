import {BlitzPage} from "blitz"

import {Sidebar} from "app/components/Sidebar"
import {NewView} from "app/components/NewView"

const ImportPage: BlitzPage = () => (
  <>
    <Sidebar />
    <NewView />
  </>
)

export default ImportPage
