import {Image} from "blitz"

export const SidebarTitle = ({title, iconPath, iconDarkPath}) => (
  <div className="px-3 mb-5 flex">
    {iconPath && (
      <div className={`mr-4 ${iconDarkPath ? "dark:hidden" : ""}`}>
        <Image src={iconPath} width="14" height="16" alt={title} />
      </div>
    )}
    {iconDarkPath && (
      <div className="mr-4 hidden dark:block ">
        <Image src={iconDarkPath} width="14" height="18" alt={title} />
      </div>
    )}
    <div className="text-sm uppercase tracking-wider text-purple-off-black dark:text-dark-mode-text font-normal font-primary">
      {title}
    </div>
  </div>
)
