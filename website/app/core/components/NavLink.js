import {Link} from "blitz"

const NavLink = ({className = "", href, children, ...props}) => {
  return (
    <Link href={href}>
      <a
        className={`block relative py-2 -mx-3 px-3 font-secondary rounded-md hover:bg-purple-light dark:hover:bg-purple-off-black hover:text-white ${className}`}
        {...props}
      >
        {children}
      </a>
    </Link>
  )
}

export {NavLink}
