import React from "react"
import { render } from "test/utils"

import Home from "./index"

test("renders blitz documentation link", () => {
  const { getByText } = render(<Home />)
  const linkElement = getByText(/Documentation/i)
  expect(linkElement).toBeInTheDocument()
})
