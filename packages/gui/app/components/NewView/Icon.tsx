import * as Icons from "heroicons-react"
import {FC} from "react"

import {IconProps} from "./types"

export const Icon: FC<IconProps> = ({icon}) => {
  // @ts-ignore
  const Icon = Object.assign({}, Icons)[icon]

  return <Icon className="w-6 h-6" />
}
