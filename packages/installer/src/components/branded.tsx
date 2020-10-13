import * as React from "react"
import {Text} from "ink"

export const Branded: React.FC = ({children}) => (
  <Text color="8a3df0" bold={true}>
    {children}
  </Text>
)
