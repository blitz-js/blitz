import {FC} from 'react'

import {ColorProps} from './types'

export const Color: FC<ColorProps> = ({color}) => <div className={`w-6 h-6 rounded-md bg-${color}-500`} />
