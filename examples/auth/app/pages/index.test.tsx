import {render} from "test/utils"

import Home from "./index"
import {useCurrentUser} from "app/hooks/useCurrentUser"

jest.mock("app/hooks/useCurrentUser")
const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>

test("renders blitz documentation link", () => {
  mockUseCurrentUser.mockReturnValue({
    id: 1,
    name: "User",
    email: "user@email.com",
    role: "user",
  })

  const {getByText} = render(<Home />)
  const element = getByText(/powered by blitz/i)
  expect(element).toBeInTheDocument()
})
