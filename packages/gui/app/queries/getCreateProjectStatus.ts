import {existsSync, promises} from "fs"

import {CREATING_FILES, DONE, INSTALLING_DEPS, RETRIEVING_DEPS, UNKNOWN} from "utils/status"

const getCreateProjectStatus = async (path: string) => {
  if (!existsSync(path)) {
    return CREATING_FILES
  }

  const files = await promises.readdir(path)

  if (!files) {
    return CREATING_FILES
  } else if (!files.includes("node_modules")) {
    return RETRIEVING_DEPS
  } else if (!files.includes("yarn.lock")) {
    return INSTALLING_DEPS
  } else if (files.includes("yarn.lock")) {
    return DONE
  }

  return UNKNOWN
}

export default getCreateProjectStatus
