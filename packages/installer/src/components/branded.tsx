import * as React from 'react'
import {Color} from 'ink'

export const Branded: React.FC = ({children}) => (
  <Color hex="8a3df0" bold={true}>
    {children}
  </Color>
)
