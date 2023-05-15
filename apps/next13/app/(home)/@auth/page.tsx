import getCurrentUser from "@/app/users/queries/getCurrentUser"
import {invoke} from "@/app/blitz-server"
import LogoutButton from "./components/Logout"

export default async function AuthenticatedHomePage() {
  const currentUser = await invoke(getCurrentUser, null)
  return (
    <>
      <LogoutButton />
      <div>
        User id: <code>{currentUser!.id}</code>
        <br />
        User role: <code>{currentUser!.role}</code>
      </div>
    </>
  )
}
