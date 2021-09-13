import {IBuilder} from "./builder"

export const NullBuilder: IBuilder<any> = {
  getTemplateValues: async () => {
    return {}
  },
}
