import Tippy from "@tippyjs/react"
import {Link, useRouter} from "blitz"
import {PlusCircleOutline} from "heroicons-react"
import {FC} from "react"

export const NewSwitch: FC = () => {
  const router = useRouter()
  const isActive = router.pathname === "/new"

  return (
    <Tippy content="Create a project" placement="right" trigger="mouseenter focusin">
      <div>
        <Link href="/new">
          <a
            className={`flex justify-center py-2 transition duration-150 ease-in-out border-l-3 border-r-3 border-transparent hover:bg-gray-50 hover:border-gray-200 focus:outline-none ${
              isActive && "border-gray-900 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-600"
            }`}
            style={{borderRightColor: "transparent"}}
          >
            <div className="flex items-center justify-center w-12 h-12 text-gray-500">
              <PlusCircleOutline className="w-8 h-8" />
            </div>
          </a>
        </Link>
      </div>
    </Tippy>
  )
}
