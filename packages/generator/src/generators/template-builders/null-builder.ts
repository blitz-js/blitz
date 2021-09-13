import {IBuilder} from "./builder"

const NullBuilder: IBuilder<any> = {
  getTemplateValues: async () => {
    return {}
  },
}

export default NullBuilder
