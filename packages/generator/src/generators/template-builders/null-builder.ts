import {IBuilder} from "./builder"

export const NullBuilder: IBuilder<any> = {
  // eslint-disable-next-line require-await
  getTemplateValues: async () => {
    return {}
  },
}
